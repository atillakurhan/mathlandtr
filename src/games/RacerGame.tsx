import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useMergedQuestions, GameEndOverlay, GameHeader } from "./GameShell";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

// Endless runner: questions appear as gates, pick the correct answer to pass.
export default function RacerGame() {
  const { lang } = useApp();
  const { questions } = useMergedQuestions("racer", "easy");
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [pos, setPos] = useState(0); // 0..100 visual progress to gate
  const [speed, setSpeed] = useState(0.7);
  const [finished, setFinished] = useState(false);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<null | "ok" | "bad">(null);

  const current = questions[qIdx % Math.max(questions.length, 1)];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setPos((p) => Math.min(100, p + speed));
    }, 40);
    return () => clearInterval(id);
  }, [running, speed]);

  useEffect(() => {
    if (pos >= 100 && running) {
      // missed the gate
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setRunning(false); setFinished(true); }
        return nl;
      });
      setFeedback("bad");
      setQIdx((i) => i + 1);
      setPos(0);
      setTimeout(() => setFeedback(null), 250);
    }
  }, [pos, running]);

  function answer(val: number) {
    if (!running || !current) return;
    if (val === current.answer) {
      setScore((s) => s + 12);
      setSpeed((s) => Math.min(2.2, s + 0.05));
      setFeedback("ok");
    } else {
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setRunning(false); setFinished(true); }
        return nl;
      });
      setFeedback("bad");
    }
    setQIdx((i) => i + 1);
    setPos(0);
    setTimeout(() => setFeedback(null), 200);
  }

  function start() {
    setScore(0); setLives(3); setPos(0); setQIdx(0); setSpeed(0.7); setFinished(false); setRunning(true);
  }

  const choices = current?.choices ?? (current ? [current.answer, current.answer + 2, current.answer - 1, current.answer + 5] : []);

  return (
    <div className="space-y-4">
      <GameHeader
        game="racer"
        score={score}
        right={<span className="rounded-md bg-destructive/15 px-2 py-1 text-xs font-bold text-destructive">{"❤".repeat(Math.max(0, lives))}</span>}
      />

      <div className="relative aspect-[16/9] rounded-xl border border-border overflow-hidden shadow-card">
        {/* Road */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 bg-yellow-300 opacity-70" style={{ backgroundImage: "repeating-linear-gradient(0deg, #facc15 0 24px, transparent 24px 48px)" }} />
        {/* Car */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-4xl drop-shadow">🏎️</div>
        {/* Gate */}
        {running && current && (
          <div
            style={{ bottom: `${10 + pos * 0.7}%` }}
            className={`absolute left-1/2 -translate-x-1/2 transition-[bottom] ease-linear rounded-lg bg-background/95 border border-border px-4 py-2 shadow-card ${feedback === "ok" ? "ring-2 ring-success" : feedback === "bad" ? "ring-2 ring-destructive" : ""}`}
          >
            <p className="font-bold text-center">{current.prompt}</p>
          </div>
        )}
        {!running && !finished && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={start} className="rounded-xl bg-hero px-8 py-4 text-primary-foreground font-bold shadow-glow">{t("start_game", lang)}</button>
          </div>
        )}
        {finished && <GameEndOverlay score={score} game="racer" onRestart={start} />}
      </div>

      {running && current && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {choices.slice(0, 4).map((c) => (
            <Button key={c} variant="outline" size="lg" className="text-lg font-bold" onClick={() => answer(c)}>
              {c}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
