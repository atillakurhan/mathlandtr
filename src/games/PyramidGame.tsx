import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { GameEndOverlay, GameHeader } from "./GameShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";

// Number pyramid: bottom row has N numbers, each upper cell = sum of two below.
// User fills upper cells. Score for each correct cell, bonus for solving fully.
export default function PyramidGame() {
  const { lang, classLevel } = useApp();
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [finished, setFinished] = useState(false);
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

  // values[row][i] — row 0 = bottom prefilled
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
    setScore((s) => s + correct * 5 + bonus);
    if (round + 1 >= TOTAL) setFinished(true);
    else setRound((r) => r + 1);
  }

  function restart() { setScore(0); setRound(0); setFinished(false); }

  return (
    <div className="space-y-4">
      <GameHeader game="pyramid" score={score} right={<span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">{round + 1}/{TOTAL}</span>} />

      <div className="relative rounded-xl border border-border bg-board p-6 shadow-card">
        <div className="flex flex-col-reverse items-center gap-2">
          {Array.from({ length: N }).map((_, r) => (
            <div key={r} className="flex gap-2">
              {Array.from({ length: N - r }).map((_, i) => {
                const isBottom = r === 0;
                const v = values[r]?.[i];
                const correct = !isBottom && v === solution[r][i];
                return isBottom ? (
                  <div key={i} className="flex h-12 w-14 sm:h-14 sm:w-16 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold shadow-soft">
                    {bottom[i]}
                  </div>
                ) : (
                  <Input
                    key={i}
                    type="number"
                    value={v === "" ? "" : v}
                    onChange={(e) => setCell(r, i, e.target.value)}
                    className={`h-12 w-14 sm:h-14 sm:w-16 text-center font-bold text-base ${correct ? "ring-2 ring-success" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center">
          <Button onClick={check}>{t("save", lang)} ✓</Button>
        </div>

        {finished && <GameEndOverlay score={score} game="pyramid" onRestart={restart} />}
      </div>
    </div>
  );
}
