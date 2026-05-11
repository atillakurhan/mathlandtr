import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { GameEndOverlay, GameHeader } from "./GameShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";

interface Scenario {
  prompt: string;
  answer: number;
  unit: string;
}

function makeChange(): Scenario {
  const price = (1 + Math.random() * 19).toFixed(2);
  const tendered = Math.ceil(parseFloat(price) + 1 + Math.random() * 8);
  const change = +(tendered - parseFloat(price)).toFixed(2);
  return { prompt: `Toplam: ${price} € · Verilen: ${tendered} € · Para üstü?`, answer: change, unit: "€" };
}
function makePercent(): Scenario {
  const base = 20 + Math.floor(Math.random() * 480);
  const pct = [5, 10, 12, 15, 19, 20, 25, 30][Math.floor(Math.random() * 8)];
  const ans = +((base * pct) / 100).toFixed(2);
  return { prompt: `${pct}% von ${base} € = ?`, answer: ans, unit: "€" };
}
function makeInterest(): Scenario {
  const k = 100 + Math.floor(Math.random() * 19) * 50;
  const p = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)];
  const t = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
  const ans = +((k * p * t) / 100).toFixed(2);
  return { prompt: `Kapital ${k} € · ${p}% · ${t} Jahre · Zinsen?`, answer: ans, unit: "€" };
}

export default function MarketplaceGame() {
  const { classLevel, lang } = useApp();
  const TOTAL = 8;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [val, setVal] = useState("");
  const [finished, setFinished] = useState(false);
  const [last, setLast] = useState<null | "ok" | "bad">(null);

  const scenario: Scenario = useMemo(() => {
    if (classLevel === 3) return makeChange();
    return Math.random() > 0.5 ? makePercent() : makeInterest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, classLevel]);

  function submit() {
    const n = Number(val.replace(",", "."));
    const correct = Math.abs(n - scenario.answer) < 0.011;
    if (correct) setScore((s) => s + 20);
    setLast(correct ? "ok" : "bad");
    setTimeout(() => {
      setLast(null);
      if (round + 1 >= TOTAL) setFinished(true);
      else setRound((r) => r + 1);
      setVal("");
    }, 600);
  }

  function restart() { setScore(0); setRound(0); setFinished(false); setVal(""); }

  return (
    <div className="space-y-4">
      <GameHeader game="market" score={score} right={<span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">{round + 1}/{TOTAL}</span>} />

      <div className="relative rounded-xl border border-border bg-board p-6 shadow-card">
        <div className="grid sm:grid-cols-[160px_1fr] gap-6 items-center">
          <div className="text-7xl text-center">🛒</div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {classLevel === 3 ? t("g_market_desc", lang) : "Prozentrechnung & Zinsen"}
            </p>
            <p className="text-lg sm:text-xl font-bold leading-snug">{scenario.prompt}</p>
            <div className="mt-4 flex gap-2 items-center">
              <Input
                type="text"
                inputMode="decimal"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className={`text-lg font-bold ${last === "ok" ? "ring-2 ring-success" : last === "bad" ? "ring-2 ring-destructive" : ""}`}
                placeholder={scenario.unit}
              />
              <Button onClick={submit}>{t("answer", lang)}</Button>
            </div>
            {last === "bad" && (
              <p className="text-xs text-destructive mt-2">{t("wrong", lang)} — {scenario.answer} {scenario.unit}</p>
            )}
          </div>
        </div>

        {finished && <GameEndOverlay score={score} game="market" onRestart={restart} />}
      </div>
    </div>
  );
}
