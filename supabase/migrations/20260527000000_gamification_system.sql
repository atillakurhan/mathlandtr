
-- ─── Classrooms ───────────────────────────────────────────────────────────────
CREATE TABLE public.classrooms (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text    NOT NULL,
  school      text,
  invite_code text    NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 6)),
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers manage own classrooms" ON public.classrooms FOR ALL TO authenticated
  USING  (teacher_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (teacher_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Members view classroom" ON public.classrooms FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classroom_members WHERE classroom_id = id AND student_id = auth.uid()));

-- ─── Classroom Members ────────────────────────────────────────────────────────
CREATE TABLE public.classroom_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher sees own class" ON public.classroom_members FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classrooms WHERE id = classroom_id AND teacher_id = auth.uid()));
CREATE POLICY "Student sees own rows" ON public.classroom_members FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "Student joins classroom" ON public.classroom_members FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Teacher removes students" ON public.classroom_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classrooms WHERE id = classroom_id AND teacher_id = auth.uid()));

-- ─── Wallets (XP + Coins) ────────────────────────────────────────────────────
CREATE TABLE public.wallets (
  user_id    uuid    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp         integer NOT NULL DEFAULT 0 CHECK (xp >= 0),
  coins      integer NOT NULL DEFAULT 100 CHECK (coins >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User manages own wallet" ON public.wallets FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Teacher views student wallets" ON public.wallets FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'teacher') OR public.has_role(auth.uid(),'admin'));

-- ─── Streaks ──────────────────────────────────────────────────────────────────
CREATE TABLE public.streaks (
  user_id            uuid  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_days       integer NOT NULL DEFAULT 0,
  longest_days       integer NOT NULL DEFAULT 0,
  last_activity_date date,
  freeze_used_at     date,
  updated_at         timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User manages own streak" ON public.streaks FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Characters ───────────────────────────────────────────────────────────────
CREATE TABLE public.characters (
  id               text PRIMARY KEY,
  name             text    NOT NULL,
  price            integer NOT NULL DEFAULT 500,
  ability_de       text,
  mentor_for_game  text,
  emoji            text    NOT NULL DEFAULT '🥦',
  is_starter       boolean NOT NULL DEFAULT false
);
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads characters" ON public.characters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manages characters" ON public.characters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.characters (id, name, price, ability_de, mentor_for_game, emoji, is_starter) VALUES
  ('yumurtacan',  'Yumurtacan',       0,   'Gibt beim 2. Versuch einen Hinweis',               'gleichungs', '🥚', true),
  ('abuzer',      'Abuzer',         300,   'Geometrie-Aufgaben: +20 % Münzen',                 'bauplatz',   '🧅', false),
  ('abuzeriye',   'Abuzeriye',      400,   'Jede richtige Antwort: +2 XP Bonus',               null,         '🥜', false),
  ('mango',       'Mango Prinzessin',500,  'Bruchaufgaben: +20 % Münzen',                      'pizza',      '🥭', false),
  ('pirasa',      'Pırasa',         400,   'Verlängert die Zeit bei Funktionsaufgaben',         'katapult',   '🥬', false),
  ('susi',        'Suşi',           350,   'Kein Punktabzug bei falscher Antwort',              null,         '🍣', false),
  ('tursuctacan', 'Turşuctacan',    450,   'Extra-Hinweis bei Daten-Aufgaben',                 'daten',      '🥒', false);

-- ─── Owned Characters ─────────────────────────────────────────────────────────
CREATE TABLE public.owned_characters (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id text    NOT NULL REFERENCES public.characters(id),
  is_companion boolean NOT NULL DEFAULT false,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, character_id)
);
ALTER TABLE public.owned_characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User manages own characters" ON public.owned_characters FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Wardrobe Items ───────────────────────────────────────────────────────────
CREATE TABLE public.wardrobe_items (
  id               text    PRIMARY KEY,
  slot             text    NOT NULL CHECK (slot IN ('hat','glasses','outfit','accessory')),
  name_de          text    NOT NULL,
  price            integer NOT NULL DEFAULT 200,
  unlock_condition text    -- NULL = coin purchase, 'streak_7', 'streak_14', 'streak_30'
);
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads wardrobe items" ON public.wardrobe_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manages wardrobe items" ON public.wardrobe_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.wardrobe_items (id, slot, name_de, price, unlock_condition) VALUES
  ('hat_wizard',     'hat',       'Zauberhut',           150, null),
  ('hat_crown',      'hat',       'Goldkrone',            300, null),
  ('hat_beret',      'hat',       'Baskenmütze',          100, null),
  ('hat_cap',        'hat',       'Schirmmütze',           80, null),
  ('hat_streak7',    'hat',       'Streak-Hut 🔥',          0, 'streak_7'),
  ('gl_cool',        'glasses',   'Sonnenbrille',         120, null),
  ('gl_nerd',        'glasses',   'Nerd-Brille',           90, null),
  ('gl_heart',       'glasses',   'Herzbrille',           150, null),
  ('gl_pixel',       'glasses',   'Pixel-Brille',         100, null),
  ('gl_star',        'glasses',   'Sternenbrille ⭐',       0, 'streak_14'),
  ('out_suit',       'outfit',    'Anzug',                200, null),
  ('out_lab',        'outfit',    'Laborkittel',          180, null),
  ('out_cape',       'outfit',    'Superheldenumhang',    250, null),
  ('out_uniform',    'outfit',    'Schuluniform',         120, null),
  ('out_gold',       'outfit',    'Goldenes Gewand ✨',     0, 'streak_30'),
  ('acc_medal',      'accessory', 'Bronzemedaille',       100, null),
  ('acc_star',       'accessory', 'Goldstern',            200, null),
  ('acc_book',       'accessory', 'Zauberbuch',           150, null),
  ('acc_wand',       'accessory', 'Zauberstab',           180, null),
  ('acc_special',    'accessory', 'Besonderes Abzeichen',   0, 'streak_14');

-- ─── Owned Items ──────────────────────────────────────────────────────────────
CREATE TABLE public.owned_items (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id               text NOT NULL REFERENCES public.wardrobe_items(id),
  equipped_on_character text REFERENCES public.characters(id),
  purchased_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);
ALTER TABLE public.owned_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User manages own items" ON public.owned_items FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Extend existing tables ───────────────────────────────────────────────────
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS owner_type   text DEFAULT 'global' CHECK (owner_type IN ('global','teacher')),
  ADD COLUMN IF NOT EXISTS classroom_id uuid REFERENCES public.classrooms(id) ON DELETE CASCADE;

ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── Auto-init wallet + streak + starter character for every new user ─────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));

  IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id,'admin'),(NEW.id,'teacher');
  ELSIF (NEW.raw_user_meta_data->>'role') = 'teacher' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id,'teacher');
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id,'student');
  END IF;

  INSERT INTO public.wallets  (user_id, coins) VALUES (NEW.id, 100);
  INSERT INTO public.streaks  (user_id)         VALUES (NEW.id);
  INSERT INTO public.owned_characters (user_id, character_id, is_companion)
    VALUES (NEW.id, 'yumurtacan', true);
  RETURN NEW;
END;
$$;
