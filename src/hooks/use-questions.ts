import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { GameId } from "@/lib/i18n";

export type Difficulty = "easy" | "medium" | "hard";

export interface QRow {
  id: string;
  game: string;
  class_level: number;
  difficulty: string;
  locale: string;
  prompt: string;
  answer_numeric: number | null;
  answer_text: string | null;
  choices: unknown;
  payload: unknown;
}

export function useQuestions(opts: {
  game: GameId;
  classLevel: number;
  locale: string;
  difficulty?: Difficulty;
}) {
  const [data, setData] = useState<QRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    let q = supabase
      .from("questions")
      .select("*")
      .eq("game", opts.game)
      .eq("class_level", opts.classLevel)
      .eq("locale", opts.locale);
    if (opts.difficulty) q = q.eq("difficulty", opts.difficulty);
    q.order("created_at", { ascending: false }).then(({ data }) => {
      if (cancelled) return;
      setData((data ?? []) as QRow[]);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [opts.game, opts.classLevel, opts.locale, opts.difficulty]);

  return { data, loading };
}

export async function submitScore(playerName: string, game: string, classLevel: number, score: number) {
  if (!playerName?.trim()) return;
  await supabase.from("scores").insert({
    player_name: playerName.trim().slice(0, 40),
    game,
    class_level: classLevel,
    score: Math.max(0, Math.min(100000, Math.round(score))),
  });
}
