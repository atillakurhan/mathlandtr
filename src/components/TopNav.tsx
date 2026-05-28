import { Link, useRouterState } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, Trophy, Home, LogIn, LogOut, Languages } from "lucide-react";

export function TopNav() {
  const { lang, setLang, companionEmoji } = useApp();
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
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-hero text-primary-foreground shadow-glow text-xl">
            {companionEmoji}
          </span>
          <span className="hidden sm:inline">{t("app_title", lang)}</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          {navLink("/", t("back_home", lang), Home)}
          {navLink("/leaderboard", t("leaderboard", lang), Trophy)}
          {isTeacher && navLink("/admin", t("teacher_panel", lang), GraduationCap)}
        </nav>

        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={() => setLang(lang === "de" ? "tr" : "de")}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-xs font-bold uppercase hover:bg-secondary"
            title={t("language", lang)}
          >
            <Languages className="h-3.5 w-3.5" />
            {lang}
          </button>

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
