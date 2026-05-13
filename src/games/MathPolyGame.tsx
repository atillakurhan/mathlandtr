import { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useMergedQuestions, GameEndOverlay, GameHeader, FeedbackBubble, sfx } from "./GameShell";
import { Mascot } from "@/components/Mascot";
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
    { kind: "question" }, { kind: "question" },
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
  const [diceFace, setDiceFace] = useState(1);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<null | { ok: boolean; delta?: number; correctValue?: number }>(null);

  const tiles = BOARD;
  const positions = useMemo(() => {
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
    setRolling(true); sfx.click();
    const flip = setInterval(() => setDiceFace(1 + Math.floor(Math.random() * 6)), 80);
    const dice = 1 + Math.floor(Math.random() * 6);
    const target = (pos + dice) % tiles.length;
    setTimeout(() => {
      clearInterval(flip);
      setDiceFace(dice);
      setPos(target);
      const tile = tiles[target];
      setRolling(false);
      if (tile.kind === "treasure") { sfx.correct(); setScore((s) => s + tile.reward); setFeedback({ ok: true, delta: tile.reward }); setTimeout(() => setFeedback(null), 900); }
      else if (tile.kind === "bonus") { sfx.pop(); setScore((s) => s + tile.reward); setFeedback({ ok: true, delta: tile.reward }); setTimeout(() => setFeedback(null), 900); }
      else if (tile.kind === "trap") { sfx.wrong(); setScore((s) => Math.max(0, s - tile.cost)); setFeedback({ ok: false, correctValue: undefined }); setTimeout(() => setFeedback(null), 900); }
      else if (tile.kind === "question") {
        const q = questions[Math.floor(Math.random() * Math.max(questions.length, 1))];
        if (q) setPendingQ(q);
      }
      setTurns((tv) => {
        const nt = tv - 1;
        if (nt <= 0) setTimeout(() => setFinished(true), 600);
        return nt;
      });
    }, 700);
  }

  function answerQ(val: number) {
    if (!pendingQ) return;
    const ok = val === pendingQ.answer;
    if (ok) { sfx.correct(); setScore((s) => s + 20); setFeedback({ ok: true, delta: 20 }); }
    else { sfx.wrong(); setScore((s) => Math.max(0, s - 5)); setFeedback({ ok: false, correctValue: pendingQ.answer }); }
    setTimeout(() => { setPendingQ(null); setFeedback(null); }, 1100);
  }

  function restart() {
    setPos(0); setScore(0); setTurns(10); setPendingQ(null); setFinished(false); setFeedback(null);
  }

  const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  return (
    <div className="space-y-4">
      <GameHeader
        game="mathpoly"
        score={score}
        right={<span className="rounded-md bg-secondary px-2 py-1 text-xs font-bold">🎲 {turns}</span>}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="relative aspect-[7/4] rounded-2xl border border-border bg-gradient-to-br from-fuchsia-100 via-purple-50 to-indigo-100 shadow-card overflow-hidden">
          <div className="absolute top-2 right-2 text-3xl opacity-50">🏰</div>
          <div className="absolute bottom-2 left-2 text-2xl opacity-60">✨</div>

          {tiles.map((tile, i) => {
            const p = positions[i];
            const color =
              tile.kind === "start" ? "bg-gradient-to-br from-primary to-blue-600 text-primary-foreground" :
              tile.kind === "treasure" ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" :
              tile.kind === "bonus" ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" :
              tile.kind === "trap" ? "bg-gradient-to-br from-rose-500 to-red-600 text-white" :
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
                <div className={`relative h-11 w-11 sm:h-12 sm:w-12 rounded-lg ${color} flex items-center justify-center text-base font-bold shadow-soft border-2 border-white/40 ${pos === i ? "ring-2 ring-foreground scale-110" : ""}`}>
                  {label}
                  {pos === i && (
                    <div className="absolute -top-4 -right-2 text-2xl drop-shadow animate-bounce">🧙</div>
                  )}
                </div>
              </div>
            );
          })}

          <FeedbackBubble feedback={feedback} />
          {finished && <GameEndOverlay score={score} game="mathpoly" onRestart={restart} />}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Mascot mood={pendingQ ? "think" : "happy"} size={48} />
            <h3 className="font-bold text-sm">Macera Tahtası</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            💎 +15 · ✨ +8 · ⚡ −5 · ? = soru
          </p>

          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white text-5xl shadow-glow ${rolling ? "animate-spin" : ""}`}>
            {diceFaces[diceFace - 1]}
          </div>

          <Button onClick={roll} disabled={!!pendingQ || rolling || finished} size="lg">
            <Dice5 className="h-5 w-5 mr-1" /> {rolling ? "..." : "Zar At"}
          </Button>

          {pendingQ && (
            <div className="rounded-xl bg-secondary p-3 mt-2 space-y-2 border-2 border-primary/30 animate-in slide-in-from-bottom">
              <p className="text-base font-extrabold text-primary text-center">{pendingQ.prompt}</p>
              <div className="grid grid-cols-2 gap-2">
                {(pendingQ.choices ?? [pendingQ.answer, pendingQ.answer + 1, pendingQ.answer - 1, pendingQ.answer + 3]).map((c) => (
                  <Button key={c} variant="outline" className="font-bold" onClick={() => answerQ(c)} disabled={!!feedback}>{c}</Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
