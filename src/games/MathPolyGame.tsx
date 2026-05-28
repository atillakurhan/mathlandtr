import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useMergedQuestions, DifficultyPicker, GameEndOverlay, GameHeader, FeedbackBubble, sfx, type MergedQ } from "./GameShell";
import type { Difficulty } from "@/hooks/use-questions";
import { Button } from "@/components/ui/button";
import { Dice5 } from "lucide-react";
import { t } from "@/lib/i18n";

type TileKind = "start" | "question" | "treasure" | "bonus" | "trap" | "finish";
interface Tile {
  kind: TileKind;
  label: string;
  color: string;
  value: number;
}

// Linear 14-tile board — kolay takip edilir, net bitiş
const BOARD: Tile[] = [
  { kind: "start",    label: "★",  color: "from-primary to-blue-600",         value: 0 },
  { kind: "question", label: "?",  color: "from-violet-400 to-purple-600",    value: 0 },
  { kind: "treasure", label: "💎", color: "from-emerald-400 to-emerald-600",  value: 15 },
  { kind: "question", label: "?",  color: "from-violet-400 to-purple-600",    value: 0 },
  { kind: "bonus",    label: "✨", color: "from-amber-400 to-orange-500",     value: 8 },
  { kind: "question", label: "?",  color: "from-violet-400 to-purple-600",    value: 0 },
  { kind: "trap",     label: "⚡", color: "from-rose-500 to-red-600",         value: 5 },
  { kind: "question", label: "?",  color: "from-violet-400 to-purple-600",    value: 0 },
  { kind: "treasure", label: "💎", color: "from-emerald-400 to-emerald-600",  value: 15 },
  { kind: "question", label: "?",  color: "from-violet-400 to-purple-600",    value: 0 },
  { kind: "bonus",    label: "✨", color: "from-amber-400 to-orange-500",     value: 8 },
  { kind: "question", label: "?",  color: "from-violet-400 to-purple-600",    value: 0 },
  { kind: "trap",     label: "⚡", color: "from-rose-500 to-red-600",         value: 5 },
  { kind: "finish",   label: "🏆", color: "from-yellow-400 to-amber-600",     value: 50 },
];

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

// 4 benzersiz seçenek üret (cevap dahil)
function buildChoices(q: MergedQ): number[] {
  if (q.choices && q.choices.length >= 2) {
    const uniq = [...new Set(q.choices)];
    if (uniq.length >= 4) return shuffle(uniq.slice(0, 4));
    const filler = uniq.slice();
    let d = 1;
    while (filler.length < 4) {
      const cand = q.answer + (filler.length % 2 === 0 ? d : -d);
      if (!filler.includes(cand)) filler.push(cand);
      d++;
    }
    return shuffle(filler);
  }
  const set = new Set<number>([q.answer]);
  let d = 1;
  while (set.size < 4) {
    set.add(q.answer + d);
    if (set.size < 4) set.add(q.answer - d);
    d++;
  }
  return shuffle([...set]);
}
function shuffle<T>(a: T[]) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

export default function MathPolyGame() {
  const { lang, unlockThresholds, companionEmoji } = useApp();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const { questions } = useMergedQuestions("mathpoly", difficulty);

  const [pos, setPos] = useState(0);
  const [score, setScore] = useState(0);
  const [diceFace, setDiceFace] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [finished, setFinished] = useState(false);
  const [pendingQ, setPendingQ] = useState<null | { q: MergedQ; choices: number[] }>(null);
  const [feedback, setFeedback] = useState<null | { ok: boolean; delta?: number; correctValue?: number }>(null);

  // Snake layout: 7 sütun x 2 satır
  const cols = 7;
  const positions = useMemo(() => {
    return BOARD.map((_, i) => {
      const row = Math.floor(i / cols);
      const colInRow = row % 2 === 0 ? i % cols : cols - 1 - (i % cols);
      return { x: colInRow / (cols - 1), y: row / 1 };
    });
  }, []);

  function handleTile(idx: number) {
    const tile = BOARD[idx];
    if (tile.kind === "treasure") {
      sfx.correct();
      setScore((s) => s + tile.value);
      setFeedback({ ok: true, delta: tile.value });
      setTimeout(() => setFeedback(null), 900);
    } else if (tile.kind === "bonus") {
      sfx.pop();
      setScore((s) => s + tile.value);
      setFeedback({ ok: true, delta: tile.value });
      setTimeout(() => setFeedback(null), 900);
    } else if (tile.kind === "trap") {
      sfx.wrong();
      setScore((s) => Math.max(0, s - tile.value));
      setFeedback({ ok: false });
      setTimeout(() => setFeedback(null), 900);
    } else if (tile.kind === "question") {
      const q = questions[Math.floor(Math.random() * Math.max(questions.length, 1))];
      if (!q) return;
      setPendingQ({ q, choices: buildChoices(q) });
    } else if (tile.kind === "finish") {
      sfx.win();
      setScore((s) => s + tile.value);
      setTimeout(() => setFinished(true), 700);
    }
  }

  function roll() {
    if (pendingQ || finished || rolling) return;
    setRolling(true);
    sfx.click();
    const flip = setInterval(() => setDiceFace(1 + Math.floor(Math.random() * 6)), 90);
    const dice = 1 + Math.floor(Math.random() * 6);
    setTimeout(() => {
      clearInterval(flip);
      setDiceFace(dice);
      // Bitişi geçme — clamp
      const target = Math.min(pos + dice, BOARD.length - 1);
      setPos(target);
      setRolling(false);
      setTimeout(() => handleTile(target), 350);
    }, 800);
  }

  function answerQ(val: number) {
    if (!pendingQ) return;
    const ok = val === pendingQ.q.answer;
    if (ok) {
      sfx.correct();
      setScore((s) => s + 20);
      setFeedback({ ok: true, delta: 20 });
    } else {
      sfx.wrong();
      setScore((s) => Math.max(0, s - 5));
      setFeedback({ ok: false, correctValue: pendingQ.q.answer });
    }
    setTimeout(() => {
      setPendingQ(null);
      setFeedback(null);
    }, 1200);
  }

  const totalKey = "ma_total_mathpoly";
  const totalRef = typeof window !== "undefined" ? Number(localStorage.getItem(totalKey) ?? 0) : 0;
  const unlocked = {
    easy: true,
    medium: totalRef >= unlockThresholds.medium,
    hard: totalRef >= unlockThresholds.hard,
  };
  useEffect(() => {
    if (finished && score > 0 && typeof window !== "undefined") {
      localStorage.setItem(totalKey, String(totalRef + score));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function restart() {
    setPos(0); setScore(0); setPendingQ(null); setFinished(false); setFeedback(null);
  }

  const tilesLeft = BOARD.length - 1 - pos;

  return (
    <div className="space-y-4">
      <GameHeader
        game="mathpoly"
        score={score}
        right={<>
          <DifficultyPicker difficulty={difficulty} setDifficulty={setDifficulty} unlocked={unlocked} />
          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-bold">🏁 {tilesLeft}</span>
        </>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Board */}
        <div className="relative aspect-[7/2] rounded-2xl border border-border bg-gradient-to-br from-fuchsia-50 via-purple-50 to-indigo-100 p-4 shadow-card overflow-hidden">
          <div className="absolute top-2 right-3 text-3xl opacity-40">🏰</div>
          <div className="absolute bottom-2 left-3 text-2xl opacity-40">✨</div>

          {BOARD.map((tile, i) => {
            const p = positions[i];
            const isHere = pos === i;
            return (
              <div
                key={i}
                style={{
                  left: `calc(${p.x * 100}% * 0.86 + 7%)`,
                  top:  `calc(${p.y * 100}% * 0.6 + 20%)`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all"
              >
                <div className={`relative h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br ${tile.color} text-white flex items-center justify-center text-lg font-extrabold shadow-soft border-2 border-white/50 ${isHere ? "ring-4 ring-foreground/70 scale-110 z-10" : ""}`}>
                  {tile.label}
                  {isHere && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl drop-shadow animate-bounce">
                      {companionEmoji}
                    </div>
                  )}
                </div>
                <div className="mt-1 text-center text-[9px] font-mono text-muted-foreground">{i}</div>
              </div>
            );
          })}

          <FeedbackBubble feedback={feedback} />
          {finished && <GameEndOverlay score={score} game="mathpoly" onRestart={restart} />}
        </div>

        {/* Controls */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft flex flex-col gap-3">
          <p className="text-xs text-muted-foreground text-center">{t("board_legend", lang)}</p>

          <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white text-6xl shadow-glow ${rolling ? "animate-spin" : ""}`}>
            {DICE_FACES[diceFace - 1]}
          </div>

          <Button onClick={roll} disabled={!!pendingQ || rolling || finished} size="lg" className="w-full">
            <Dice5 className="h-5 w-5 mr-1" /> {rolling ? t("rolling", lang) : t("roll_dice", lang)}
          </Button>

          {pendingQ ? (
            <div className="rounded-xl bg-secondary p-3 space-y-2 border-2 border-primary/40 animate-in slide-in-from-bottom">
              <p className="text-base font-extrabold text-primary text-center">{pendingQ.q.prompt}</p>
              <div className="grid grid-cols-2 gap-2">
                {pendingQ.choices.map((c, idx) => (
                  <Button key={`${c}-${idx}`} variant="outline" className="font-bold" onClick={() => answerQ(c)} disabled={!!feedback}>
                    {c}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-center text-muted-foreground italic">
              {finished ? "🏆" : pos === 0 ? "🎲 Würfle, um zu starten!" : `📍 ${pos} / ${BOARD.length - 1}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
