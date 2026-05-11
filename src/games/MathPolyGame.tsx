import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useMergedQuestions, GameEndOverlay, GameHeader } from "./GameShell";
import { Button } from "@/components/ui/button";
import { Dice5 } from "lucide-react";
import { t } from "@/lib/i18n";

type Tile =
  | { kind: "start" }
  | { kind: "treasure"; reward: number }
  | { kind: "question" }
  | { kind: "bonus"; reward: number }
  | { kind: "trap"; cost: number };

const BOARD: Tile[] = (() => {
  const arr: Tile[] = [{ kind: "start" }];
  const pool: Tile[] = [
    { kind: "question" },
    { kind: "question" },
    { kind: "treasure", reward: 15 },
    { kind: "bonus", reward: 8 },
    { kind: "trap", cost: 5 },
    { kind: "question" },
  ];
  for (let i = 0; i < 19; i++) arr.push(pool[i % pool.length]);
  return arr;
})();

export default function MathPolyGame() {
  const { lang } = useApp();
  const { questions } = useMergedQuestions("mathpoly", "easy");
  const [pos, setPos] = useState(0);
  const [score, setScore] = useState(0);
  const [turns, setTurns] = useState(10);
  const [pendingQ, setPendingQ] = useState<null | (typeof questions)[number]>(null);
  const [rolling, setRolling] = useState(false);
  const [finished, setFinished] = useState(false);

  const tiles = BOARD;
  const positions = useMemo(() => {
    // arrange tiles on a rectangular border
    const N = tiles.length;
    const out: { x: number; y: number }[] = [];
    const cols = 7, rows = 4;
    for (let i = 0; i < N; i++) {
      if (i < cols) out.push({ x: i / (cols - 1), y: 0 });
      else if (i < cols + rows - 1) out.push({ x: 1, y: (i - cols + 1) / (rows - 1) });
      else if (i < cols * 2 + rows - 2) out.push({ x: 1 - (i - cols - rows + 2) / (cols - 1), y: 1 });
      else out.push({ x: 0, y: 1 - (i - cols * 2 - rows + 3) / (rows - 1) });
    }
    return out;
  }, [tiles.length]);

  function roll() {
    if (pendingQ || finished || rolling) return;
    setRolling(true);
    const dice = 1 + Math.floor(Math.random() * 6);
    const target = (pos + dice) % tiles.length;
    setTimeout(() => {
      setPos(target);
      const tile = tiles[target];
      setRolling(false);
      if (tile.kind === "treasure") setScore((s) => s + tile.reward);
      else if (tile.kind === "bonus") setScore((s) => s + tile.reward);
      else if (tile.kind === "trap") setScore((s) => Math.max(0, s - tile.cost));
      else if (tile.kind === "question") {
        const q = questions[Math.floor(Math.random() * Math.max(questions.length, 1))];
        if (q) setPendingQ(q);
      }
      setTurns((t) => {
        const nt = t - 1;
        if (nt <= 0) setTimeout(() => setFinished(true), 400);
        return nt;
      });
    }, 500);
  }

  function answerQ(val: number) {
    if (!pendingQ) return;
    if (val === pendingQ.answer) setScore((s) => s + 20);
    else setScore((s) => Math.max(0, s - 5));
    setPendingQ(null);
  }

  function restart() {
    setPos(0); setScore(0); setTurns(10); setPendingQ(null); setFinished(false);
  }

  return (
    <div className="space-y-4">
      <GameHeader
        game="mathpoly"
        score={score}
        right={<span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">🎲 {turns}</span>}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="relative aspect-[7/4] rounded-xl border border-border bg-board shadow-card overflow-hidden">
          {tiles.map((tile, i) => {
            const p = positions[i];
            const color =
              tile.kind === "start" ? "bg-primary text-primary-foreground" :
              tile.kind === "treasure" ? "bg-success/80 text-success-foreground" :
              tile.kind === "bonus" ? "bg-accent text-accent-foreground" :
              tile.kind === "trap" ? "bg-destructive/80 text-destructive-foreground" :
              "bg-card text-foreground";
            const label =
              tile.kind === "start" ? "★" :
              tile.kind === "treasure" ? "💎" :
              tile.kind === "bonus" ? "✨" :
              tile.kind === "trap" ? "⚡" : "?";
            return (
              <div
                key={i}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div className={`relative h-11 w-11 sm:h-12 sm:w-12 rounded-md ${color} flex items-center justify-center text-sm font-bold shadow-soft border border-border`}>
                  {label}
                  {pos === i && (
                    <div className="absolute -top-3 -right-3 h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center shadow-glow ring-2 ring-background">
                      👟
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {finished && <GameEndOverlay score={score} game="mathpoly" onRestart={restart} />}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-soft flex flex-col gap-3">
          <h3 className="font-semibold">{t("start_game", lang)}</h3>
          <p className="text-xs text-muted-foreground">
            💎 +15 · ✨ +8 · ⚡ −5 · ? = {t("prompt", lang)}
          </p>
          <Button onClick={roll} disabled={!!pendingQ || rolling || finished} size="lg">
            <Dice5 className="h-5 w-5 mr-1" /> {rolling ? "…" : "Roll"}
          </Button>

          {pendingQ && (
            <div className="rounded-md bg-secondary p-3 mt-2 space-y-2">
              <p className="text-sm font-bold">{pendingQ.prompt}</p>
              <div className="grid grid-cols-2 gap-2">
                {(pendingQ.choices ?? [pendingQ.answer, pendingQ.answer + 1, pendingQ.answer - 1, pendingQ.answer + 3]).map((c) => (
                  <Button key={c} variant="outline" onClick={() => answerQ(c)}>{c}</Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
