import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useQuestions, submitScore, type Difficulty } from "@/hooks/use-questions";
import { useStreak } from "@/hooks/use-streak";
import { generateFallback, type FQ } from "@/lib/fallback-questions";
import { t, GAMES, pickCheer, type GameId } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Lock, RotateCcw, Home, Volume2, VolumeX } from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { Mascot } from "@/components/Mascot";
import { sfx } from "@/lib/sound";

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

export function useCompanionAbility() {
  const { companionCharId } = useApp();
  return {
    noPenalty: companionCharId === "susi",
    extraTime:  companionCharId === "pirasa" ? 15 : 0,
    giveHint:   companionCharId === "yumurtacan",
  } as const;
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
  correctCount = 0,
}: {
  score: number;
  game: GameId;
  onRestart: () => void;
  correctCount?: number;
}) {
  const { lang, playerName, classLevel, addXP, addCoins, refreshStreak, companionCharId, companionEmoji } = useApp();
  const { recordActivity } = useStreak();
  const g = GAMES.find((x) => x.id === game)!;
  const [submitted, setSubmitted] = useState(false);
  const [streakBonus, setStreakBonus] = useState<{ coins: number; days: number } | null>(null);

  // Companion ability bonuses
  const abilityXpBonus = companionCharId === "abuzeriye" ? correctCount * 2 : 0;
  const xpEarned = Math.max(5, Math.round(score / 5)) + abilityXpBonus;
  const coinsEarned = Math.max(5, Math.round(score / 8));

  useEffect(() => {
    if (submitted) return;
    setSubmitted(true);
    submitScore(playerName || "Anonym", game, classLevel, score);
    addXP(xpEarned);
    addCoins(coinsEarned);
    sfx.win();
    recordActivity().then(({ coinBonus, newStreak }) => {
      refreshStreak(newStreak);
      if (coinBonus > 0) {
        addCoins(coinBonus);
        setStreakBonus({ coins: coinBonus, days: newStreak });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stars = score > 150 ? 3 : score > 60 ? 2 : score > 0 ? 1 : 0;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/85 backdrop-blur-sm rounded-xl">
      <Confetti show={stars > 0} count={36} />
      <div className="rounded-2xl bg-card p-8 text-center shadow-card border border-border max-w-sm w-[90%] animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-5xl animate-bounce">{companionEmoji}</span>
          <span className="text-5xl">{g.emoji}</span>
        </div>
        <h3 className="text-2xl font-extrabold">{t("finished", lang)}</h3>
        <div className="my-3 flex justify-center gap-1 text-3xl">
          {[1, 2, 3].map((i) => (
            <span key={i} className={i <= stars ? "" : "opacity-20 grayscale"}>⭐</span>
          ))}
        </div>
        <p className="text-5xl font-extrabold text-primary tabular-nums">{score}</p>
        <p className="text-sm text-muted-foreground">{t("score", lang)}</p>
        <div className="flex justify-center gap-3 mt-1 text-xs font-bold">
          <span className="text-violet-600">+{xpEarned} XP{abilityXpBonus > 0 && <span className="opacity-70"> (+{abilityXpBonus} {companionEmoji})</span>}</span>
          <span className="text-amber-600">+{coinsEarned} 🪙</span>
        </div>
        {streakBonus && (
          <div className="mt-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 text-sm font-bold text-orange-700 dark:text-orange-300">
            {t("streak_bonus", lang, { n: streakBonus.days, coins: streakBonus.coins })}
          </div>
        )}
        <p className="text-sm font-semibold text-success mt-2">{t(stars >= 2 ? "cheer_great" : "cheer_keep", lang)}</p>
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
  const [muted, setMuted] = useState(sfx.isMuted());
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className={`flex items-center gap-2 rounded-xl bg-gradient-to-br ${g.gradient} px-3 py-2 text-white shadow-soft`}>
        <span className="text-3xl drop-shadow">{g.emoji}</span>
        <div>
          <h1 className="font-extrabold text-lg leading-tight drop-shadow">{t(g.nameKey, lang)}</h1>
          <p className="text-[11px] opacity-90">{playerName || "Anonim"}</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {right}
        <button
          onClick={() => { const v = !muted; sfx.setMuted(v); setMuted(v); }}
          className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground"
          title={muted ? t("sound_off", lang) : t("sound_on", lang)}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <div className="rounded-lg bg-primary px-3 py-1.5 text-primary-foreground font-bold tabular-nums shadow-soft text-base">
          {score}
        </div>
      </div>
    </div>
  );
}

// Floating reaction bubble — shows companion emoji + cheer text
export function FeedbackBubble({
  feedback,
}: {
  feedback: null | { ok: boolean; delta?: number; correctValue?: number | string };
}) {
  const { lang, companionEmoji } = useApp();
  if (!feedback) return null;
  const cheer = pickCheer(feedback.ok);
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-200">
      <div className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-2 shadow-glow border-2 ${
        feedback.ok ? "bg-success text-success-foreground border-white/60" : "bg-destructive text-destructive-foreground border-white/60"
      }`}>
        <span className={`text-5xl ${feedback.ok ? "animate-bounce" : "animate-pulse"}`}>{companionEmoji}</span>
        <p className="text-sm font-extrabold">{t(cheer, lang)}</p>
        {feedback.ok && typeof feedback.delta === "number" && (
          <p className="text-xs font-bold">+{feedback.delta}</p>
        )}
        {!feedback.ok && feedback.correctValue !== undefined && (
          <p className="text-[11px] font-semibold opacity-90">
            {t("the_answer_was", lang)}: <span className="font-bold">{feedback.correctValue}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export { sfx, Confetti, Mascot };
