import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { GameEndOverlay, GameHeader, FeedbackBubble, sfx } from "./GameShell";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";

export default function PyramidGame() {
  const { lang, classLevel } = useApp();
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<null | { ok: boolean; delta?: number }>(null);
  const TOTAL = 6;
  const N = classLevel === 8 ? 5 : 4;

  const bottom = useMemo(() => {
    const max = classLevel === 8 ? 25 : 12;
    return Array.from({ length: N }, () => 1 + Math.floor(Math.random() * max));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, N]);

  const solution = useMemo(() => {
    const rows: number[][] = [bottom];
    for (let r = 1; r < N; r++) {
      const prev = rows[r - 1];
      const cur: number[] = [];
      for (let i = 0; i < prev.length - 1; i++) cur.push(prev[i] + prev[i + 1]);
      rows.push(cur);
    }
    return rows;
  }, [bottom, N]);

  const [values, setValues] = useState<(number | "")[][]>(() => [
    bottom,
    ...Array.from({ length: N - 1 }, (_, r) => Array.from({ length: N - 1 - r }, () => "" as number | "")),
  ]);
  useEffect(() => {
    setValues([
      bottom,
      ...Array.from({ length: N - 1 }, (_, r) => Array.from({ length: N - 1 - r }, () => "" as number | "")),
    ]);
  }, [bottom, N]);

  function setCell(r: number, i: number, v: string) {
    const num = v === "" ? "" : Number(v);
    setValues((prev) => prev.map((row, ri) => (ri === r ? row.map((c, ci) => (ci === i ? (num as number | "") : c)) : row)));
  }

  function check() {
    let correct = 0;
    let total = 0;
    for (let r = 1; r < N; r++) {
      for (let i = 0; i < N - r; i++) {
        total++;
        if (values[r][i] === solution[r][i]) correct++;
      }
    }
    const bonus = correct === total ? 20 : 0;
    const delta = correct * 5 + bonus;
    setScore((s) => s + delta);
    if (correct === total) sfx.correct(); else if (correct === 0) sfx.wrong(); else sfx.pop();
    setFeedback({ ok: correct === total, delta });
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= TOTAL) setFinished(true);
      else setRound((r) => r + 1);
    }, 1200);
  }

  function restart() { setScore(0); setRound(0); setFinished(false); setFeedback(null); }

  return (
    <div className="space-y-4">
      <GameHeader game="pyramid" score={score} right={<span className="rounded-md bg-secondary px-2 py-1 text-xs font-bold">{round + 1}/{TOTAL}</span>} />

      <div className="relative rounded-2xl border border-border bg-gradient-to-b from-orange-200 via-amber-100 to-yellow-50 p-6 shadow-card overflow-hidden">
        {/* Desert scene */}
        <div className="absolute top-3 right-4 text-5xl">☀️</div>
        <div className="absolute top-5 right-20 text-2xl opacity-70">☁️</div>
        <div className="absolute bottom-2 left-3 text-3xl">🐪</div>
        <div className="absolute bottom-2 right-3 text-2xl">🌵</div>
        <div className="absolute left-2 top-2"><Mascot mood={feedback ? (feedback.ok ? "cheer" : "think") : "think"} size={48} /></div>

        <p className="text-center text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 mt-1">
          {t(classLevel === 3 ? "pyramid_hint_3" : "pyramid_hint_8", lang)}
        </p>

        <div className="relative flex flex-col-reverse items-center gap-2">
          {Array.from({ length: N }).map((_, r) => (
            <div key={r} className="flex gap-2">
              {Array.from({ length: N - r }).map((_, i) => {
                const isBottom = r === 0;
                const v = values[r]?.[i];
                const correct = !isBottom && v !== "" && v === solution[r][i];
                return isBottom ? (
                  <div key={i} className="flex h-12 w-14 sm:h-14 sm:w-16 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white font-extrabold text-lg shadow-card border-2 border-amber-300">
                    {bottom[i]}
                  </div>
                ) : (
                  <Input
                    key={i}
                    type="number"
                    value={v === "" ? "" : v}
                    onChange={(e) => setCell(r, i, e.target.value)}
                    className={`h-12 w-14 sm:h-14 sm:w-16 text-center font-extrabold text-base bg-white/90 ${correct ? "ring-2 ring-success bg-success/10" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center">
          <Button onClick={check} size="lg" disabled={!!feedback}>✨ {t("save", lang)}</Button>
        </div>

        <FeedbackBubble feedback={feedback} />
        {finished && <GameEndOverlay score={score} game="pyramid" onRestart={restart} />}
      </div>
    </div>
  );
}
