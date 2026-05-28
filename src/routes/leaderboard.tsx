import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { t, GAMES } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

interface Row {
  player_name: string;
  game: string;
  class_level: number;
  total: number;
  best: number;
}

function LeaderboardPage() {
  const { lang, classLevel } = useApp();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    supabase
      .from("scores")
      .select("player_name, game, class_level, score")
      .eq("class_level", classLevel)
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data }) => {
        const map = new Map<string, Row>();
        for (const r of data ?? []) {
          const key = `${r.player_name}|${r.game}`;
          const prev = map.get(key);
          if (prev) {
            prev.total += r.score;
            prev.best = Math.max(prev.best, r.score);
          } else {
            map.set(key, {
              player_name: r.player_name,
              game: r.game,
              class_level: r.class_level,
              total: r.score,
              best: r.score,
            });
          }
        }
        setRows([...map.values()].sort((a, b) => b.total - a.total));
      });
  }, [classLevel]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-bold">{t("leaderboard", lang)}</h1>
        <span className="ml-auto text-sm text-muted-foreground">
          {t("class_8", lang)}
        </span>

      </div>

      <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left">
            <tr>
              <th className="px-3 py-2 w-12">#</th>
              <th className="px-3 py-2">{t("player_name", lang)}</th>
              <th className="px-3 py-2">{t("game", lang)}</th>
              <th className="px-3 py-2 text-right">{t("high_score", lang)}</th>
              <th className="px-3 py-2 text-right">{t("total_score", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">{t("no_scores", lang)}</td></tr>
            )}
            {rows.map((r, i) => {
              const g = GAMES.find((x) => x.id === r.game);
              return (
                <tr key={`${r.player_name}-${r.game}`} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-2 font-medium">{r.player_name}</td>
                  <td className="px-3 py-2">
                    {g ? `${g.emoji} ${t(g.nameKey, lang)}` : r.game}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-accent-foreground/80">{r.best}</td>
                  <td className="px-3 py-2 text-right font-bold text-primary tabular-nums">{r.total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
