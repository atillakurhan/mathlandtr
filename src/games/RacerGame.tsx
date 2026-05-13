import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useMergedQuestions, GameEndOverlay, GameHeader, FeedbackBubble, sfx } from "./GameShell";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

export default function RacerGame() {
  const { lang } = useApp();
  const { questions } = useMergedQuestions("racer", "easy");
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [pos, setPos] = useState(0);
  const [speed, setSpeed] = useState(0.7);
  const [finished, setFinished] = useState(false);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<null | { ok: boolean; delta?: number; correctValue?: number }>(null);
  const [stripeOffset, setStripeOffset] = useState(0);

  const current = questions[qIdx % Math.max(questions.length, 1)];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setPos((p) => Math.min(100, p + speed));
      setStripeOffset((o) => (o + speed * 4) % 48);
    }, 40);
    return () => clearInterval(id);
  }, [running, speed]);

  useEffect(() => {
    if (pos >= 100 && running) {
      sfx.wrong();
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setRunning(false); setFinished(true); }
        return nl;
      });
      setFeedback({ ok: false, correctValue: current?.answer });
      setQIdx((i) => i + 1);
      setPos(0);
      setTimeout(() => setFeedback(null), 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, running]);

  function answer(val: number) {
    if (!running || !current || feedback) return;
    const ok = val === current.answer;
    if (ok) {
      sfx.correct();
      setScore((s) => s + 12);
      setSpeed((s) => Math.min(2.2, s + 0.05));
      setFeedback({ ok: true, delta: 12 });
    } else {
      sfx.wrong();
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setRunning(false); setFinished(true); }
        return nl;
      });
      setFeedback({ ok: false, correctValue: current.answer });
    }
    setTimeout(() => {
      setQIdx((i) => i + 1);
      setPos(0);
      setFeedback(null);
    }, 600);
  }

  function start() {
    setScore(0); setLives(3); setPos(0); setQIdx(0); setSpeed(0.7); setFinished(false); setRunning(true); setFeedback(null);
  }

  const choices = current?.choices ?? (current ? [current.answer, current.answer + 2, current.answer - 1, current.answer + 5] : []);

  return (
    <div className="space-y-4">
      <GameHeader
        game="racer"
        score={score}
        right={<>
          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">⚡ {speed.toFixed(1)}x</span>
          <span className="rounded-md bg-destructive/15 px-2 py-1 text-xs font-bold text-destructive">{"❤".repeat(Math.max(0, lives))}</span>
        </>}
      />

      <div className="relative aspect-[16/9] rounded-2xl border border-border overflow-hidden shadow-card">
        {/* Sky */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-indigo-400 to-purple-300" />
        <div className="absolute top-3 left-6 text-2xl">🌙</div>
        <div className="absolute top-4 right-12 text-xl opacity-70">⭐</div>
        <div className="absolute top-8 right-24 text-xs opacity-70">⭐</div>
        {/* Road */}
        <div className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-b from-slate-700 to-slate-900" />
        {/* Side grass */}
        <div className="absolute left-0 top-1/3 bottom-0 w-[12%] bg-emerald-700" />
        <div className="absolute right-0 top-1/3 bottom-0 w-[12%] bg-emerald-700" />
        {/* Animated lane stripes */}
        <div
          className="absolute inset-y-1/3 left-1/2 -translate-x-1/2 w-2"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, #facc15 0 24px, transparent 24px 48px)",
            backgroundPositionY: `${stripeOffset}px`,
          }}
        />

        {/* Mascot pit-side */}
        <div className="absolute left-2 bottom-2 z-10"><Mascot mood={feedback ? (feedback.ok ? "cheer" : "sad") : "think"} size={50} /></div>

        {/* Car */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg" style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.5))" }}>🏎️</div>

        {/* Gate (question) */}
        {running && current && (
          <div
            style={{ bottom: `${10 + pos * 0.7}%` }}
            className={`absolute left-1/2 -translate-x-1/2 transition-[bottom] ease-linear rounded-xl bg-white/95 border-2 px-4 py-2 shadow-glow ${feedback?.ok ? "border-success ring-2 ring-success" : feedback && !feedback.ok ? "border-destructive ring-2 ring-destructive" : "border-primary/40"}`}
          >
            <p className="font-extrabold text-center text-lg text-primary">{current.prompt}</p>
          </div>
        )}

        <FeedbackBubble feedback={feedback} />

        {!running && !finished && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button onClick={start} className="rounded-2xl bg-hero px-8 py-4 text-primary-foreground font-extrabold text-lg shadow-glow hover:scale-105 transition-transform">
              🏁 {t("start_game", lang)}
            </button>
          </div>
        )}
        {finished && <GameEndOverlay score={score} game="racer" onRestart={start} />}
      </div>

      {running && current && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {choices.slice(0, 4).map((c, i) => (
            <Button
              key={`${c}-${i}`}
              variant="outline"
              size="lg"
              className="text-lg font-extrabold border-2 hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-transform"
              onClick={() => answer(c)}
              disabled={!!feedback}
            >
              {c}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
