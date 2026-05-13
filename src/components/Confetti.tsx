import { useEffect, useState } from "react";

interface Piece { id: number; x: number; delay: number; color: string; emoji?: string; }

const COLORS = [
  "oklch(0.65 0.16 150)",
  "oklch(0.83 0.16 85)",
  "oklch(0.6 0.2 320)",
  "oklch(0.52 0.18 255)",
  "oklch(0.78 0.17 50)",
];
const EMOJIS = ["⭐", "🎉", "✨", "🌟", "💫"];

export function Confetti({ show, count = 28 }: { show: boolean; count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!show) { setPieces([]); return; }
    const arr: Piece[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: COLORS[i % COLORS.length],
      emoji: i % 4 === 0 ? EMOJIS[i % EMOJIS.length] : undefined,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 1800);
    return () => clearTimeout(t);
  }, [show, count]);

  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-30">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 text-lg"
          style={{
            left: `${p.x}%`,
            color: p.color,
            animation: `confettiFall 1.4s ${p.delay}s cubic-bezier(.2,.6,.4,1) forwards`,
          }}
        >
          {p.emoji ?? "●"}
        </span>
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(420px) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
