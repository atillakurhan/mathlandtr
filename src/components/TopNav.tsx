import { Link, useRouterState } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { WalletBar } from "./WalletBar";
import { StreakBadge } from "./StreakBadge";
import { GraduationCap, Trophy, Home, LogIn, LogOut, ShoppingBag, Shirt, Users } from "lucide-react";

export function TopNav() {
  const { lang, companionEmoji } = useApp();
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
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-hero text-primary-foreground shadow-glow text-xl">
            {companionEmoji}
          </span>
          <span className="hidden sm:inline">{t("app_title", lang)}</span>
        </Link>

        {/* Main nav */}
        <nav className="ml-auto flex items-center gap-1">
          {navLink("/", t("back_home", lang), Home)}
          {navLink("/leaderboard", t("leaderboard", lang), Trophy)}
          {user && navLink("/shop", t("shop", lang), ShoppingBag)}
          {user && navLink("/wardrobe", t("wardrobe", lang), Shirt)}
          {user && navLink("/classroom", t("classroom", lang), Users)}
          {isTeacher && navLink("/admin", t("teacher_panel", lang), GraduationCap)}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-2">
          {user && <StreakBadge />}
          {user && <WalletBar />}

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
