import { Link, useRouterState } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";
import { t, type Lang, type ClassLevel } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, Trophy, Home, LogIn, LogOut } from "lucide-react";

export function TopNav() {
  const { lang, setLang, classLevel, setClassLevel } = useApp();
  const { user, isTeacher } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const navLink = (to: string, label: string, Icon: typeof Home) => (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        path === to
          ? "bg-primary text-primary-foreground"
          : "text-foreground/80 hover:bg-secondary"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-hero text-primary-foreground shadow-glow">
            ∑
          </span>
          <span>{t("app_title", lang)}</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          {navLink("/", t("back_home", lang), Home)}
          {navLink("/leaderboard", t("leaderboard", lang), Trophy)}
          {isTeacher && navLink("/admin", t("teacher_panel", lang), GraduationCap)}
        </nav>

        <div className="flex items-center gap-2 ml-2">
          <div className="flex rounded-md border border-border bg-secondary p-0.5 text-xs font-semibold">
            {([3, 8] as ClassLevel[]).map((c) => (
              <button
                key={c}
                onClick={() => setClassLevel(c)}
                className={`rounded px-2 py-1 transition-colors ${
                  classLevel === c
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-secondary-foreground hover:bg-background"
                }`}
              >
                {c === 3 ? t("class_3", lang) : t("class_8", lang)}
              </button>
            ))}
          </div>
          <div className="flex rounded-md border border-border bg-secondary p-0.5 text-xs font-semibold">
            {(["tr", "de"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded px-2 py-1 uppercase transition-colors ${
                  lang === l
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary-foreground hover:bg-background"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          {user ? (
            <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline ml-1">{t("logout", lang)}</span>
            </Button>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="outline">
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline ml-1">{t("login", lang)}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
