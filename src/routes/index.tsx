import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { GAMES, t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { lang, classLevel, playerName, setPlayerName } = useApp();
  const [nameDraft, setNameDraft] = useState(playerName);
  const [topScores, setTopScores] = useState<{ player_name: string; total: number }[]>([]);

  useEffect(() => setNameDraft(playerName), [playerName]);

  useEffect(() => {
    supabase
      .from("scores")
      .select("player_name, score")
      .eq("class_level", classLevel)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        const map = new Map<string, number>();
        for (const r of data ?? []) map.set(r.player_name, (map.get(r.player_name) ?? 0) + r.score);
        const arr = [...map.entries()]
          .map(([player_name, total]) => ({ player_name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        setTopScores(arr);
      });
  }, [classLevel]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-hero p-6 sm:p-10 text-primary-foreground shadow-card">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            {classLevel === 3 ? t("class_3", lang) : t("class_8", lang)}
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t("app_title", lang)}
          </h1>
          <p className="mt-2 max-w-xl text-base sm:text-lg text-primary-foreground/85">
            {t("app_tag", lang)}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder={t("enter_name", lang)}
              className="max-w-xs bg-white/95 text-foreground placeholder:text-muted-foreground"
              maxLength={40}
            />
            <Button
              onClick={() => setPlayerName(nameDraft.trim())}
              variant="secondary"
              className="font-semibold"
            >
              {t("save", lang)}
            </Button>
            <Link to="/leaderboard">
              <Button variant="outline" className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20">
                <Trophy className="mr-1 h-4 w-4" /> {t("leaderboard", lang)}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Game grid */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">
          {classLevel === 3 ? t("class_3", lang) : t("class_8", lang)} · {t("start_playing", lang)}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g) => (
            <Link
              key={g.id}
              to={"/games/$gameId"}
              params={{ gameId: g.id }}
              className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-2xl">
                  {g.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t(g.nameKey, lang)}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{t(g.descKey, lang)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Mini leaderboard */}
      <section className="mt-8 rounded-xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            {t("leaderboard", lang)}
          </h2>
          <Link to="/leaderboard" className="text-sm text-primary hover:underline">
            {t("manage", lang)} →
          </Link>
        </div>
        {topScores.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("no_scores", lang)}</p>
        ) : (
          <ol className="space-y-1.5">
            {topScores.map((s, i) => (
              <li
                key={s.player_name}
                className="flex items-center justify-between rounded-md bg-secondary/60 px-3 py-2 text-sm"
              >
                <span className="font-mono w-6 text-muted-foreground">{i + 1}.</span>
                <span className="flex-1 font-medium truncate">{s.player_name}</span>
                <span className="font-bold text-primary tabular-nums">{s.total}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
