import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useQuestions, submitScore, type Difficulty } from "@/hooks/use-questions";
import { generateFallback, type FQ } from "@/lib/fallback-questions";
import { t, GAMES, type GameId } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Lock, RotateCcw, Home } from "lucide-react";

export interface MergedQ {
  prompt: string;
  answer: number;
  choices?: number[];
  fromDb: boolean;
}

export function useMergedQuestions(game: GameId, difficulty: Difficulty) {
  const { classLevel, lang } = useApp();
  const { data, loading } = useQuestions({ game, classLevel, locale: lang, difficulty });
  const fallback = useMemo(() => generateFallback(game, classLevel, 14), [game, classLevel]);

  const merged: MergedQ[] = useMemo(() => {
    const fromDb: MergedQ[] = data
      .filter((d) => d.answer_numeric !== null)
      .map((d) => ({
        prompt: d.prompt,
        answer: Number(d.answer_numeric),
        choices: Array.isArray(d.choices) ? (d.choices as number[]) : undefined,
        fromDb: true,
      }));
    if (fromDb.length >= 5) return shuffle(fromDb);
    return shuffle([...fromDb, ...fallback.map((f: FQ) => ({ ...f, fromDb: false }))]);
  }, [data, fallback]);

  return { questions: merged, loading, hasCustom: data.length > 0 };
}

function shuffle<T>(a: T[]) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

export function DifficultyPicker({
  difficulty,
  setDifficulty,
  unlocked,
}: {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  unlocked: { easy: boolean; medium: boolean; hard: boolean };
}) {
  const { lang } = useApp();
  const opts: { d: Difficulty; label: string }[] = [
    { d: "easy", label: t("easy", lang) },
    { d: "medium", label: t("medium", lang) },
    { d: "hard", label: t("hard", lang) },
  ];
  return (
    <div className="flex gap-1.5 rounded-md border border-border bg-secondary p-1 text-xs font-semibold">
      {opts.map((o) => {
        const isOpen = unlocked[o.d];
        return (
          <button
            key={o.d}
            onClick={() => isOpen && setDifficulty(o.d)}
            disabled={!isOpen}
            className={`flex items-center gap-1 rounded px-2.5 py-1 transition-colors ${
              difficulty === o.d
                ? "bg-primary text-primary-foreground shadow-soft"
                : isOpen
                ? "text-secondary-foreground hover:bg-background"
                : "text-muted-foreground/50 cursor-not-allowed"
            }`}
          >
            {!isOpen && <Lock className="h-3 w-3" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function GameEndOverlay({
  score,
  game,
  onRestart,
}: {
  score: number;
  game: GameId;
  onRestart: () => void;
}) {
  const { lang, playerName, classLevel } = useApp();
  const g = GAMES.find((x) => x.id === game)!;
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (submitted) return;
    submitScore(playerName || "Anonim", game, classLevel, score);
    setSubmitted(true);
  }, [submitted, playerName, game, classLevel, score]);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/85 backdrop-blur-sm rounded-xl">
      <div className="rounded-xl bg-card p-8 text-center shadow-card border border-border max-w-sm w-[90%]">
        <div className="text-5xl mb-2">{g.emoji}</div>
        <h3 className="text-xl font-bold">{t("finished", lang)}</h3>
        <p className="text-4xl font-extrabold text-primary my-3 tabular-nums">{score}</p>
        <p className="text-sm text-muted-foreground">{t("score", lang)}</p>
        <div className="mt-5 flex gap-2 justify-center">
          <Button onClick={onRestart}><RotateCcw className="h-4 w-4 mr-1" />{t("play_again", lang)}</Button>
          <Link to="/"><Button variant="outline"><Home className="h-4 w-4 mr-1" />{t("back_home", lang)}</Button></Link>
        </div>
      </div>
    </div>
  );
}

export function GameHeader({
  game,
  score,
  right,
}: {
  game: GameId;
  score: number;
  right?: React.ReactNode;
}) {
  const { lang, playerName } = useApp();
  const g = GAMES.find((x) => x.id === game)!;
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-3xl">{g.emoji}</span>
        <div>
          <h1 className="font-bold text-lg leading-tight">{t(g.nameKey, lang)}</h1>
          <p className="text-xs text-muted-foreground">{playerName || "Anonim"}</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {right}
        <div className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground font-bold tabular-nums shadow-soft">
          {score}
        </div>
      </div>
    </div>
  );
}
