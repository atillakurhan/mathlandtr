import { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { GameEndOverlay, GameHeader, FeedbackBubble, sfx } from "./GameShell";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t, type Lang } from "@/lib/i18n";
import { toast } from "sonner";

interface Scenario {
  prompt: string;
  answer: number;
  unit: string;
  emoji: string;
}

const PRODUCTS = ["🍎", "🥕", "🍞", "🧀", "🥛", "🍌", "🥚", "🍇", "🥦", "🍓"];

function rand<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }

function makeChange(lang: Lang): Scenario {
  const price = (1 + Math.random() * 19).toFixed(2);
  const tendered = Math.ceil(parseFloat(price) + 1 + Math.random() * 8);
  const change = +(tendered - parseFloat(price)).toFixed(2);
  const emoji = rand(PRODUCTS);
  const prompt = lang === "tr"
    ? `${emoji} ${price} € · Verilen: ${tendered} € · Para üstü?`
    : `${emoji} ${price} € · Gegeben: ${tendered} € · Wechselgeld?`;
  return { prompt, answer: change, unit: "€", emoji };
}
function makePercent(lang: Lang): Scenario {
  const base = 20 + Math.floor(Math.random() * 480);
  const pct = [5, 10, 12, 15, 19, 20, 25, 30][Math.floor(Math.random() * 8)];
  const ans = +((base * pct) / 100).toFixed(2);
  const prompt = lang === "tr"
    ? `${base} €'nin %${pct}'si = ?`
    : `${pct}% von ${base} € = ?`;
  return { prompt, answer: ans, unit: "€", emoji: "🏷️" };
}
function makeInterest(lang: Lang): Scenario {
  const k = 100 + Math.floor(Math.random() * 19) * 50;
  const p = [2, 3, 4, 5, 6, 8][Math.floor(Math.random() * 6)];
  const tt = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
  const ans = +((k * p * tt) / 100).toFixed(2);
  const prompt = lang === "tr"
    ? `Anapara: ${k} € · Faiz: %${p} · Süre: ${tt} yıl · Faiz tutarı?`
    : `Kapital: ${k} € · ${p}% · ${tt} Jahre · Zinsen?`;
  return { prompt, answer: ans, unit: "€", emoji: "💰" };
}

export default function MarketplaceGame() {
  const { classLevel, lang } = useApp();
  const TOTAL = 8;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [val, setVal] = useState("");
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<null | { ok: boolean; delta?: number; correctValue?: number | string }>(null);

  const scenario: Scenario = useMemo(() => {
    if (classLevel === 3) return makeChange(lang);
    return Math.random() > 0.5 ? makePercent(lang) : makeInterest(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, classLevel, lang]);

  function submit() {
    const n = Number(val.replace(",", "."));
    if (Number.isNaN(n) || val.trim() === "") {
      toast.error(t("invalid_input", lang));
      return;
    }
    const ok = Math.abs(n - scenario.answer) < 0.011;
    if (ok) { sfx.correct(); setScore((s) => s + 20); setFeedback({ ok: true, delta: 20 }); }
    else { sfx.wrong(); setFeedback({ ok: false, correctValue: `${scenario.answer} ${scenario.unit}` }); }
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= TOTAL) setFinished(true);
      else setRound((r) => r + 1);
      setVal("");
    }, 1100);
  }

  function restart() { setScore(0); setRound(0); setFinished(false); setVal(""); setFeedback(null); }

  return (
    <div className="space-y-4">
      <GameHeader game="market" score={score} right={<span className="rounded-md bg-secondary px-2 py-1 text-xs font-bold">{round + 1}/{TOTAL}</span>} />

      <div className="relative rounded-2xl border border-border bg-gradient-to-br from-lime-100 via-amber-50 to-orange-100 p-6 shadow-card overflow-hidden">
        {/* Stand awning */}
        <div className="absolute inset-x-0 top-0 h-3 bg-[repeating-linear-gradient(90deg,#ef4444_0_24px,#fef3c7_24px_48px)]" />
        {/* Floating products */}
        <div className="absolute -top-2 right-4 text-3xl opacity-30 animate-bounce">🍎</div>
        <div className="absolute bottom-2 right-12 text-2xl opacity-40">🥕</div>
        <div className="absolute bottom-4 left-4 text-2xl opacity-40">🧀</div>

        <div className="relative grid sm:grid-cols-[180px_1fr] gap-6 items-center">
          <div className="text-center">
            <div className="text-7xl drop-shadow">{scenario.emoji}</div>
            <Mascot mood={feedback ? (feedback.ok ? "cheer" : "sad") : "think"} size={56} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
              {t(classLevel === 3 ? "market_sub_3" : "market_sub_8", lang)}
            </p>
            <p className="text-lg sm:text-xl font-extrabold leading-snug text-foreground">{scenario.prompt}</p>
            <div className="mt-4 flex gap-2 items-center">
              <Input
                type="text"
                inputMode="decimal"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="text-lg font-bold"
                placeholder={scenario.unit}
                disabled={!!feedback}
              />
              <Button onClick={submit} disabled={!!feedback} size="lg">{t("answer", lang)} ✓</Button>
            </div>
          </div>
        </div>

        <FeedbackBubble feedback={feedback} />
        {finished && <GameEndOverlay score={score} game="market" onRestart={restart} />}
      </div>
    </div>
  );
}
