// Tiny Web Audio helper — no assets, instant feedback for kids.
let ctx: AudioContext | null = null;
let muted = false;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); }
    catch { return null; }
  }
  return ctx;
}

function tone(freq: number, dur = 0.15, type: OscillatorType = "sine", gain = 0.08, when = 0) {
  const a = ac(); if (!a || muted) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = 0;
  o.connect(g); g.connect(a.destination);
  const t0 = a.currentTime + when;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

export const sfx = {
  correct() { tone(660, 0.12, "triangle", 0.09); tone(990, 0.18, "triangle", 0.09, 0.08); },
  wrong()   { tone(220, 0.18, "sawtooth", 0.07); tone(160, 0.22, "sawtooth", 0.07, 0.1); },
  click()   { tone(520, 0.06, "square", 0.05); },
  win()     {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", 0.09, i * 0.1));
  },
  pop()     { tone(880, 0.08, "triangle", 0.08); },
  setMuted(m: boolean) { muted = m; },
  isMuted() { return muted; },
};
