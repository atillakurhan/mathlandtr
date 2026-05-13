import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { GameEndOverlay, GameHeader, FeedbackBubble, sfx } from "./GameShell";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { t } from "@/lib/i18n";

export default function GoalkeeperGame() {
  const { lang, classLevel } = useApp();
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL = 8;
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<null | { ok: boolean; delta?: number; correctValue?: number | string }>(null);

  const [a, setA] = useState(-0.05);
  const [b, setB] = useState(1);
  const [c, setC] = useState(0);

  const [target, setTarget] = useState({ x0: 60, x1: 75 });
  const [q3, setQ3] = useState({ prompt: "", answer: 0, zones: [{ x0: 25, x1: 40, val: 0 }, { x0: 55, x1: 70, val: 0 }] });
  const [ballAnim, setBallAnim] = useState<number | null>(null); // 0..1 progress

  function nextRound() {
    if (classLevel === 8) {
      const tx0 = 30 + Math.random() * 50;
      setTarget({ x0: Math.round(tx0), x1: Math.round(tx0 + 12) });
      setA(-0.05); setB(1); setC(0);
    } else {
      const x = Math.floor(2 + Math.random() * 9);
      const y = Math.floor(2 + Math.random() * 9);
      const ans = x + y;
      const wrong = ans + (Math.random() > 0.5 ? 3 : -3);
      const correctZone = { x0: 30 + ans, x1: 30 + ans + 8, val: ans };
      const wrongZone = { x0: 30 + wrong, x1: 30 + wrong + 8, val: wrong };
      const zones = Math.random() > 0.5 ? [correctZone, wrongZone] : [wrongZone, correctZone];
      setQ3({ prompt: `${x} + ${y} = ?`, answer: ans, zones });
    }
  }

  useEffect(() => { nextRound(); /* eslint-disable-next-line */ }, [round, classLevel]);

  function trajectory(av: number, bv: number, cv: number) {
    const pts: { x: number; y: number }[] = [];
    for (let x = 0; x <= 100; x += 2) pts.push({ x, y: av * x * x + bv * x + cv });
    return pts;
  }
  const pts = trajectory(a, b, c);

  function shoot() {
    if (classLevel !== 8 || feedback) return;
    let landing = 100;
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].y <= 0 && pts[i - 1].y > 0) { landing = pts[i].x; break; }
    }
    const hit = landing >= target.x0 && landing <= target.x1;
    // animate ball
    setBallAnim(0);
    const startT = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - startT) / 900);
      setBallAnim(p);
      if (p >= 1) {
        clearInterval(id);
        if (hit) { sfx.correct(); setScore((s) => s + 25); setFeedback({ ok: true, delta: 25 }); }
        else { sfx.wrong(); setFeedback({ ok: false, correctValue: `[${target.x0}, ${target.x1}]` }); }
        setTimeout(() => { setFeedback(null); setBallAnim(null); advance(); }, 1100);
      }
    }, 30);
  }

  function chooseZone3(zoneIdx: number) {
    if (feedback) return;
    const z = q3.zones[zoneIdx];
    const ok = z.val === q3.answer;
    if (ok) { sfx.correct(); setScore((s) => s + 15); setFeedback({ ok: true, delta: 15 }); }
    else { sfx.wrong(); setFeedback({ ok: false, correctValue: q3.answer }); }
    setTimeout(() => { setFeedback(null); advance(); }, 1100);
  }

  function advance() {
    if (round + 1 >= TOTAL) setFinished(true);
    else setRound((r) => r + 1);
  }
  function restart() { setScore(0); setRound(0); setFinished(false); setFeedback(null); }

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${50 - p.y * 1.5}`).join(" ");

  // Ball position along trajectory during animation
  let ball: { x: number; y: number } | null = null;
  if (ballAnim !== null) {
    const idx = Math.min(pts.length - 1, Math.floor(ballAnim * pts.length));
    ball = { x: pts[idx].x, y: 50 - pts[idx].y * 1.5 };
  }

  return (
    <div className="space-y-4">
      <GameHeader
        game="goalie"
        score={score}
        right={<span className="rounded-md bg-secondary px-2 py-1 text-xs font-bold">{round + 1}/{TOTAL}</span>}
      />

      <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl border border-border shadow-card">
        {/* Sky + field */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-400" />
        <div className="absolute top-2 left-6 text-3xl">☁️</div>
        <div className="absolute top-3 right-10 text-3xl">☁️</div>
        <div className="absolute top-2 right-2 text-4xl">☀️</div>
        {/* Field stripes */}
        <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ backgroundImage: "repeating-linear-gradient(90deg, oklch(0.55 0.13 145) 0 12%, oklch(0.5 0.13 145) 12% 24%)" }} />

        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {/* Goal/zones */}
          {classLevel === 8 ? (
            <g>
              <rect x={target.x0} y={47} width={target.x1 - target.x0} height={3.5} fill="oklch(0.83 0.16 85)" stroke="oklch(0.5 0.15 60)" strokeWidth="0.3" />
              <text x={(target.x0 + target.x1) / 2} y={49.6} fontSize={2.4} textAnchor="middle" fontWeight={800} fill="oklch(0.2 0.05 60)">🎯</text>
            </g>
          ) : (
            q3.zones.map((z, i) => (
              <g key={i} onClick={() => chooseZone3(i)} style={{ cursor: "pointer" }}>
                <rect x={z.x0} y={43} width={z.x1 - z.x0} height={6} fill="oklch(0.83 0.16 85 / 0.9)" stroke="oklch(0.5 0.15 60)" strokeWidth="0.3" rx="1" />
                <text x={(z.x0 + z.x1) / 2} y={48} fontSize={4} textAnchor="middle" fontWeight={800} fill="oklch(0.2 0.05 60)">{z.val}</text>
              </g>
            ))
          )}
          {/* Trajectory preview class 8 */}
          {classLevel === 8 && <path d={path} stroke="oklch(0.52 0.18 255)" strokeWidth={0.5} fill="none" strokeDasharray="1 0.8" opacity="0.6" />}
          {/* Ball start */}
          <circle cx={0} cy={50} r={1.4} fill="white" stroke="oklch(0.18 0.04 260)" strokeWidth={0.3} />
          {/* Animated ball */}
          {ball && <circle cx={ball.x} cy={ball.y} r={1.6} fill="white" stroke="oklch(0.18 0.04 260)" strokeWidth={0.4} />}
        </svg>

        {/* Goal frame on right */}
        <div className="absolute right-2 bottom-[18%] text-5xl">🥅</div>
        <div className="absolute left-1 bottom-[18%] text-3xl">⚽</div>
        <div className="absolute left-2 top-2"><Mascot mood={feedback ? (feedback.ok ? "cheer" : "sad") : "think"} size={50} /></div>

        <FeedbackBubble feedback={feedback} />
        {finished && <GameEndOverlay score={score} game="goalie" onRestart={restart} />}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
        {classLevel === 8 ? (
          <div className="space-y-3">
            <p className="text-sm font-bold text-primary">f(x) = a·x² + b·x + c — 🎯 Ziel: x ∈ [{target.x0}, {target.x1}]</p>
            {([
              ["a", a, setA, -0.2, 0, 0.005],
              ["b", b, setB, 0, 3, 0.05],
              ["c", c, setC, 0, 10, 0.5],
            ] as const).map(([label, val, setter, min, max, step]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="font-mono w-6 text-sm font-bold">{label}</span>
                <Slider
                  value={[val as number]}
                  min={min as number}
                  max={max as number}
                  step={step as number}
                  onValueChange={(v) => (setter as (n: number) => void)(v[0])}
                  className="flex-1"
                />
                <span className="font-mono text-xs tabular-nums w-14 text-right">{(val as number).toFixed(2)}</span>
              </div>
            ))}
            <Button onClick={shoot} className="w-full" size="lg" disabled={!!feedback || ballAnim !== null}>⚽ Schießen!</Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-2xl font-extrabold text-primary">{q3.prompt}</p>
            <p className="text-xs text-muted-foreground mt-1">👇 Doğru bölgeye dokun</p>
          </div>
        )}
      </div>
    </div>
  );
}
