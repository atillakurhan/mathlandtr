import { useEffect, useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { GameEndOverlay, GameHeader } from "./GameShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { t } from "@/lib/i18n";

// Parabolic shot: 3rd grade = pick correct horizontal angle (sum/diff zone)
// 8th grade = adjust a,b,c of f(x)=ax²+bx+c so trajectory enters a target zone
export default function GoalkeeperGame() {
  const { lang, classLevel } = useApp();
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL = 8;
  const [finished, setFinished] = useState(false);

  // params
  const [a, setA] = useState(-0.05);
  const [b, setB] = useState(1);
  const [c, setC] = useState(0);

  // target zone: x ∈ [tx0, tx1] on ground line y=0
  const [target, setTarget] = useState({ x0: 60, x1: 75 });

  // For class 3: simple toggle of two zones, choose by solving small problem
  const [q3, setQ3] = useState({ prompt: "", answer: 0, zones: [{ x0: 25, x1: 40, val: 0 }, { x0: 55, x1: 70, val: 0 }] });

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

  // trajectory points (0..100 in x, y in 0..100, ground y=0 top of svg)
  function trajectory(av: number, bv: number, cv: number) {
    const pts: { x: number; y: number }[] = [];
    for (let x = 0; x <= 100; x += 2) {
      const y = av * x * x + bv * x + cv;
      pts.push({ x, y });
    }
    return pts;
  }
  const pts = trajectory(a, b, c);

  function shoot() {
    if (classLevel === 8) {
      // find x where y crosses 0 (after start) — landing point
      let landing = 100;
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].y <= 0 && pts[i - 1].y > 0) { landing = pts[i].x; break; }
      }
      const hit = landing >= target.x0 && landing <= target.x1;
      setScore((s) => s + (hit ? 25 : 0));
    }
    advance();
  }

  function chooseZone3(zoneIdx: number) {
    const z = q3.zones[zoneIdx];
    setScore((s) => s + (z.val === q3.answer ? 15 : 0));
    advance();
  }

  function advance() {
    if (round + 1 >= TOTAL) setFinished(true);
    else setRound((r) => r + 1);
  }

  function restart() { setScore(0); setRound(0); setFinished(false); }

  // SVG: x 0..100 -> 0..100% width; y 0..30 -> bottom..top (flipped)
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${50 - p.y * 1.5}`).join(" ");

  return (
    <div className="space-y-4">
      <GameHeader
        game="goalie"
        score={score}
        right={<span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">{round + 1}/{TOTAL}</span>}
      />

      <div className="relative aspect-[16/8] w-full overflow-hidden rounded-xl border border-border bg-gradient-to-b from-sky-200/50 to-emerald-300/60 shadow-card">
        {/* Field */}
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {/* Goal/target zones */}
          {classLevel === 8 ? (
            <rect x={target.x0} y={48} width={target.x1 - target.x0} height={3} fill="oklch(0.83 0.16 85)" />
          ) : (
            q3.zones.map((z, i) => (
              <g key={i} onClick={() => chooseZone3(i)} style={{ cursor: "pointer" }}>
                <rect x={z.x0} y={43} width={z.x1 - z.x0} height={6} fill="oklch(0.83 0.16 85 / 0.85)" />
                <text x={(z.x0 + z.x1) / 2} y={48} fontSize={4} textAnchor="middle" fontWeight={800} fill="oklch(0.2 0.05 60)">{z.val}</text>
              </g>
            ))
          )}
          {/* Ground */}
          <line x1={0} y1={50} x2={100} y2={50} stroke="oklch(0.4 0.07 150)" strokeWidth={0.3} />
          {/* Trajectory (only class 8) */}
          {classLevel === 8 && <path d={path} stroke="oklch(0.52 0.18 255)" strokeWidth={0.6} fill="none" strokeDasharray="1 0.5" />}
          {/* Ball start */}
          <circle cx={0} cy={50} r={1.2} fill="oklch(0.18 0.04 260)" />
        </svg>

        {finished && <GameEndOverlay score={score} game="goalie" onRestart={restart} />}
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
        {classLevel === 8 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold">f(x) = a·x² + b·x + c — Ziel: x ∈ [{target.x0}, {target.x1}]</p>
            {([
              ["a", a, setA, -0.2, 0, 0.005],
              ["b", b, setB, 0, 3, 0.05],
              ["c", c, setC, 0, 10, 0.5],
            ] as const).map(([label, val, setter, min, max, step]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="font-mono w-6 text-sm">{label}</span>
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
            <Button onClick={shoot} className="w-full">⚽ {t("start_game", lang)}</Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg font-bold">{q3.prompt}</p>
            <p className="text-xs text-muted-foreground">Doğru bölgeye dokun</p>
          </div>
        )}
      </div>
    </div>
  );
}
