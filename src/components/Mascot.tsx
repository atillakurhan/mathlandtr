// A friendly owl mascot that reacts to game events.
// "happy" = won/correct, "sad" = wrong, "think" = idle/thinking.

type Mood = "think" | "happy" | "sad" | "cheer";

export function Mascot({
  mood = "think",
  size = 56,
  message,
}: {
  mood?: Mood;
  size?: number;
  message?: string;
}) {
  const eyeY = mood === "sad" ? 30 : 28;
  const mouth =
    mood === "happy" || mood === "cheer"
      ? "M40 56 Q50 66 60 56"
      : mood === "sad"
      ? "M40 60 Q50 52 60 60"
      : "M42 58 Q50 60 58 58";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`relative ${mood === "cheer" ? "animate-bounce" : mood === "happy" ? "animate-pulse" : ""}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {/* body */}
          <ellipse cx="50" cy="58" rx="36" ry="36" fill="oklch(0.78 0.07 80)" />
          <ellipse cx="50" cy="62" rx="24" ry="26" fill="oklch(0.94 0.04 90)" />
          {/* ear tufts */}
          <path d="M18 28 L24 12 L32 26 Z" fill="oklch(0.78 0.07 80)" />
          <path d="M82 28 L76 12 L68 26 Z" fill="oklch(0.78 0.07 80)" />
          {/* eyes */}
          <circle cx="38" cy={eyeY} r="9" fill="white" />
          <circle cx="62" cy={eyeY} r="9" fill="white" />
          <circle cx="38" cy={eyeY + 1} r="4" fill="oklch(0.2 0.05 260)" />
          <circle cx="62" cy={eyeY + 1} r="4" fill="oklch(0.2 0.05 260)" />
          <circle cx="39" cy={eyeY} r="1.4" fill="white" />
          <circle cx="63" cy={eyeY} r="1.4" fill="white" />
          {/* beak */}
          <path d="M46 40 L54 40 L50 48 Z" fill="oklch(0.78 0.17 50)" />
          {/* mouth */}
          <path d={mouth} stroke="oklch(0.4 0.08 60)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {/* cheeks when happy */}
          {(mood === "happy" || mood === "cheer") && (
            <>
              <circle cx="32" cy="52" r="4" fill="oklch(0.78 0.14 25 / 0.55)" />
              <circle cx="68" cy="52" r="4" fill="oklch(0.78 0.14 25 / 0.55)" />
            </>
          )}
        </svg>
      </div>
      {message && (
        <div className="relative max-w-[180px] rounded-xl bg-card border border-border px-3 py-1.5 shadow-soft">
          <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rotate-45 bg-card border-l border-b border-border" />
          <p className="text-xs font-semibold leading-tight">{message}</p>
        </div>
      )}
    </div>
  );
}
