import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useMergedQuestions, DifficultyPicker, GameEndOverlay, GameHeader, FeedbackBubble, sfx, type MergedQ } from "./GameShell";
import { Mascot } from "@/components/Mascot";
import { t } from "@/lib/i18n";
import type { Difficulty } from "@/hooks/use-questions";

const DURATION = 45;
const TARGETS = 4;
const BALLOON_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899"];

interface Balloon {
  id: number;
  value: number;
  x: number;
  y: number;
  dir: number;
  color: string;
}

export default function ArcheryGame() {
  const { lang, unlockThresholds } = useApp();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const { questions } = useMergedQuestions("archery", difficulty);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [feedback, setFeedback] = useState<null | { ok: boolean; delta?: number; correctValue?: number }>(null);
  const [combo, setCombo] = useState(0);
  const [popping, setPopping] = useState<number | null>(null);

  const current: MergedQ | undefined = questions[qIdx % Math.max(questions.length, 1)];

  const newRound = useCallback((q: MergedQ | undefined) => {
    if (!q) return;
    const choices = q.choices ?? [q.answer, q.answer + 1, q.answer - 2, q.answer + 3];
    const list = choices.slice(0, TARGETS).map((v, i) => ({
      id: Date.now() + i,
      value: v,
      x: 12 + (i * 22) + Math.random() * 6,
      y: 18 + Math.random() * 50,
      dir: Math.random() > 0.5 ? 1 : -1,
      color: BALLOON_COLORS[(Date.now() + i) % BALLOON_COLORS.length],
    }));
    setBalloons(list);
  }, []);

  const start = () => {
    setScore(0); setCorrectCount(0); setTime(DURATION); setQIdx(0); setCombo(0);
    newRound(questions[0]); setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTime((t) => (t <= 1 ? (setRunning(false), 0) : t - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const speed = difficulty === "hard" ? 1.6 : difficulty === "medium" ? 1.1 : 0.7;
    const id = setInterval(() => {
      setBalloons((arr) => arr.map((b) => {
        let nx = b.x + b.dir * speed;
        let dir = b.dir;
        if (nx > 92) { nx = 92; dir = -1; }
        if (nx < 4) { nx = 4; dir = 1; }
        return { ...b, x: nx, dir, y: b.y + Math.sin((Date.now() + b.id) / 600) * 0.15 };
      }));
    }, 60);
    return () => clearInterval(id);
  }, [running, difficulty]);

  function shoot(b: Balloon) {
    if (!running || !current) return;
    const ok = b.value === current.answer;
    setPopping(b.id);
    if (ok) {
      sfx.correct();
      setCorrectCount((c) => c + 1);
      const newCombo = combo + 1;
      const delta = 10 + Math.min(newCombo - 1, 4) * 2;
      setScore((s) => s + delta);
      setCombo(newCombo);
      setFeedback({ ok: true, delta });
    } else {
      sfx.wrong();
      setScore((s) => Math.max(0, s - 3));
      setCombo(0);
      setFeedback({ ok: false, correctValue: current.answer });
    }
    setTimeout(() => {
      setPopping(null);
      const nx = qIdx + 1;
      setQIdx(nx);
      newRound(questions[nx % Math.max(questions.length, 1)]);
      setFeedback(null);
    }, 700);
  }

  const totalKey = "ma_total_archery";
  const total = typeof window !== "undefined" ? Number(localStorage.getItem(totalKey) ?? 0) : 0;
  const unlocked = { easy: true, medium: total >= unlockThresholds.medium, hard: total >= unlockThresholds.hard };
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
        right={<>
          <DifficultyPicker difficulty={difficulty} setDifficulty={setDifficulty} unlocked={unlocked} />
          {combo >= 2 && <span className="rounded-md bg-accent px-2 py-1 text-xs font-extrabold text-accent-foreground animate-pulse">🔥 x{combo}</span>}
          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold tabular-nums">⏱ {time}s</span>
        </>}
      />

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border shadow-card">
        {/* Sky scene */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-300" />
        <div className="absolute top-4 left-8 text-4xl opacity-90">☁️</div>
        <div className="absolute top-10 right-16 text-3xl opacity-80">☁️</div>
        <div className="absolute top-6 right-8 text-4xl">☀️</div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-700/70 to-transparent" />
        <div className="absolute bottom-1 left-4 text-2xl">🌳</div>
        <div className="absolute bottom-1 left-1/3 text-2xl">🌲</div>
        <div className="absolute bottom-1 right-6 text-2xl">🌳</div>

        {/* Mascot question presenter */}
        <div className="absolute left-3 top-3 z-10">
          <Mascot mood={feedback ? (feedback.ok ? "cheer" : "sad") : "think"} size={56} />
        </div>

        {/* Prompt card */}
        <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-xl bg-white/95 px-5 py-2.5 text-center shadow-card border-2 border-primary/30">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t("prompt", lang)}</p>
          <p className="text-xl font-extrabold text-primary">{current?.prompt ?? "—"}</p>
        </div>

        {/* Balloons */}
        {running && balloons.map((b) => (
          <button
            key={b.id}
            onClick={() => shoot(b)}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 ${popping === b.id ? "animate-ping" : ""}`}
            disabled={popping !== null}
          >
            <div className="relative">
              <div
                className="flex h-14 w-12 sm:h-16 sm:w-14 items-center justify-center rounded-full font-extrabold text-white text-lg shadow-card border-2 border-white/70"
                style={{ background: `radial-gradient(circle at 30% 30%, white 0%, ${b.color} 35%, ${b.color} 100%)` }}
              >
                {b.value}
              </div>
              <div className="mx-auto h-3 w-0.5 bg-slate-700" />
            </div>
          </button>
        ))}

        <FeedbackBubble feedback={feedback} />

        {!running && time === DURATION && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={start}
              className="rounded-2xl bg-hero px-8 py-4 text-primary-foreground font-extrabold text-lg shadow-glow hover:scale-105 transition-transform animate-pulse"
            >
              🏹 {t("start_game", lang)}
            </button>
          </div>
        )}

        {!running && time === 0 && <GameEndOverlay score={score} game="archery" onRestart={start} correctCount={correctCount} />}
      </div>
    </div>
  );
}
