// Generated fallback questions used when the teacher hasn't added any yet.
import type { GameId } from "@/lib/i18n";

export interface FQ {
  prompt: string;
  answer: number;
  choices?: number[];
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(a: T[]): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

function withChoices(answer: number, spread = 5): FQ["choices"] {
  const set = new Set<number>([answer]);
  while (set.size < 4) set.add(answer + rand(-spread, spread) || answer + 1);
  return shuffle([...set]);
}

export function generateFallback(game: GameId, classLevel: 3 | 8, n = 12): FQ[] {
  const out: FQ[] = [];
  for (let i = 0; i < n; i++) {
    if (classLevel === 3) {
      const a = rand(2, 30);
      const b = rand(2, 30);
      const op = ["+", "-", "×"][rand(0, 2)];
      let ans = 0;
      let prompt = "";
      if (op === "+") { ans = a + b; prompt = `${a} + ${b} = ?`; }
      else if (op === "-") { ans = Math.max(a, b) - Math.min(a, b); prompt = `${Math.max(a, b)} − ${Math.min(a, b)} = ?`; }
      else { const x = rand(2, 9), y = rand(2, 9); ans = x * y; prompt = `${x} × ${y} = ?`; }
      out.push({ prompt, answer: ans, choices: withChoices(ans, 6) });
    } else {
      // 8. Sınıf / Realschule
      const variant = rand(0, 3);
      if (variant === 0) {
        const a = rand(2, 12);
        out.push({ prompt: `√${a * a} = ?`, answer: a, choices: withChoices(a, 3) });
      } else if (variant === 1) {
        const m = rand(-4, 4) || 2;
        const b = rand(-6, 6);
        const x = rand(-5, 5);
        const y = m * x + b;
        out.push({
          prompt: `f(x) = ${m}x ${b >= 0 ? "+" : "−"} ${Math.abs(b)};  f(${x}) = ?`,
          answer: y,
          choices: withChoices(y, 4),
        });
      } else if (variant === 2) {
        const p = rand(2, 9) * 5;
        const v = rand(20, 200);
        const r = Math.round(v * p) / 100;
        out.push({
          prompt: `${p}% von ${v} = ?  /  ${v} sayısının %${p}'si = ?`,
          answer: r,
          choices: withChoices(Math.round(r), 5),
        });
      } else {
        const a = rand(1, 6), b = rand(1, 8), c = rand(-5, 5);
        const x = rand(-3, 3);
        const y = a * x * x + b * x + c;
        out.push({
          prompt: `f(x) = ${a}x² + ${b}x + ${c};  f(${x}) = ?`,
          answer: y,
          choices: withChoices(y, 5),
        });
      }
    }
  }
  return out;
}
