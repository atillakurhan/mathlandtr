
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','teacher','student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles select all auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  -- First user becomes admin+teacher
  IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin'), (NEW.id, 'teacher');
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'student');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Questions
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game text NOT NULL,
  class_level smallint NOT NULL CHECK (class_level IN (3,8)),
  difficulty text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  locale text NOT NULL DEFAULT 'tr' CHECK (locale IN ('tr','de')),
  prompt text NOT NULL,
  answer_numeric numeric,
  answer_text text,
  choices jsonb,
  payload jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read questions" ON public.questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Teachers manage questions" ON public.questions FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));

-- Scores
CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  game text NOT NULL,
  class_level smallint NOT NULL CHECK (class_level IN (3,8)),
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read scores" ON public.scores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone insert scores" ON public.scores FOR INSERT TO anon, authenticated WITH CHECK (char_length(player_name) BETWEEN 1 AND 40 AND score >= 0 AND score <= 100000);
CREATE POLICY "Teachers delete scores" ON public.scores FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));

-- Settings (singleton key-value)
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Teachers manage settings" ON public.settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));

INSERT INTO public.settings(key,value) VALUES
  ('active_class', '{"level": 3}'::jsonb),
  ('unlock_thresholds', '{"medium": 50, "hard": 150}'::jsonb);
