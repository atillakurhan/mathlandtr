import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useMergedQuestions, DifficultyPicker, GameEndOverlay, GameHeader, type MergedQ } from "./GameShell";
import { t } from "@/lib/i18n";
import type { Difficulty } from "@/hooks/use-questions";

const DURATION = 45; // seconds
const TARGETS = 4;

interface Target {
  id: number;
  value: number;
  x: number; // %
  y: number; // %
  dir: number;
}

export default function ArcheryGame() {
  const { lang, unlockThresholds } = useApp();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const { questions } = useMergedQuestions("archery", difficulty);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [flash, setFlash] = useState<"hit" | "miss" | null>(null);

  const current: MergedQ | undefined = questions[qIdx % Math.max(questions.length, 1)];

  const newRound = useCallback(
    (q: MergedQ | undefined) => {
      if (!q) return;
      const choices = q.choices ?? [q.answer, q.answer + 1, q.answer - 2, q.answer + 3];
      const list = choices.slice(0, TARGETS).map((v, i) => ({
        id: Date.now() + i,
        value: v,
        x: 10 + Math.random() * 80,
        y: 15 + Math.random() * 60,
        dir: Math.random() > 0.5 ? 1 : -1,
      }));
      setTargets(list);
    },
    []
  );

  const start = () => {
    setScore(0);
    setTime(DURATION);
    setQIdx(0);
    newRound(questions[0]);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTime((t) => (t <= 1 ? (setRunning(false), 0) : t - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Movement loop
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTargets((arr) =>
        arr.map((t) => {
          let nx = t.x + t.dir * (difficulty === "hard" ? 1.6 : difficulty === "medium" ? 1.1 : 0.7);
          let dir = t.dir;
          if (nx > 92) { nx = 92; dir = -1; }
          if (nx < 4) { nx = 4; dir = 1; }
          return { ...t, x: nx, dir };
        })
      );
    }, 60);
    return () => clearInterval(id);
  }, [running, difficulty]);

  function shoot(val: number) {
    if (!running || !current) return;
    if (val === current.answer) {
      setScore((s) => s + 10);
      setFlash("hit");
    } else {
      setScore((s) => Math.max(0, s - 3));
      setFlash("miss");
    }
    const nx = qIdx + 1;
    setQIdx(nx);
    newRound(questions[nx % Math.max(questions.length, 1)]);
    setTimeout(() => setFlash(null), 250);
  }

  const unlocked = {
    easy: true,
    medium: score >= 0 || true, // free to switch before start; thresholds enforced for cross-session via high score
    hard: true,
  };
  // Use thresholds: require previous total score in localStorage
  const totalKey = "ma_total_archery";
  const total = typeof window !== "undefined" ? Number(localStorage.getItem(totalKey) ?? 0) : 0;
  unlocked.medium = total >= unlockThresholds.medium;
  unlocked.hard = total >= unlockThresholds.hard;
  useEffect(() => {
    if (!running && score > 0 && typeof window !== "undefined") {
      localStorage.setItem(totalKey, String(total + score));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div className="space-y-4">
      <GameHeader
        game="archery"
        score={score}
        right={
          <>
            <DifficultyPicker difficulty={difficulty} setDifficulty={setDifficulty} unlocked={unlocked} />
            <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold tabular-nums">⏱ {time}s</span>
          </>
        }
      />

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-board shadow-card">
        {/* Sky/forest */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200/40 via-sky-100/30 to-emerald-200/40" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-emerald-700/30" />

        {/* Prompt */}
        <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-lg bg-background/90 px-4 py-2 text-center shadow-soft border border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("prompt", lang)}</p>
          <p className="text-lg font-bold">{current?.prompt ?? "—"}</p>
        </div>

        {/* Targets */}
        {running &&
          targets.map((tg) => (
            <button
              key={tg.id}
              onClick={() => shoot(tg.value)}
              style={{ left: `${tg.x}%`, top: `${tg.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-accent-gradient font-bold text-accent-foreground text-base sm:text-lg shadow-card border-2 border-white/70 hover:scale-110 active:scale-95 transition-transform"
            >
              {tg.value}
            </button>
          ))}

        {flash && (
          <div className={`pointer-events-none absolute inset-0 ${flash === "hit" ? "bg-success/30" : "bg-destructive/30"} animate-pulse`} />
        )}

        {!running && time === DURATION && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={start}
              className="rounded-xl bg-hero px-8 py-4 text-primary-foreground font-bold text-lg shadow-glow hover:scale-105 transition-transform"
            >
              {t("start_game", lang)}
            </button>
          </div>
        )}

        {!running && time === 0 && <GameEndOverlay score={score} game="archery" onRestart={start} />}
      </div>
    </div>
  );
}
