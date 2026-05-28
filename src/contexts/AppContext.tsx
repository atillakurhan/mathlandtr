import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang, ClassLevel } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Fixed at 8 — uygulama yalnızca 8. sınıfa odaklıdır. */
  classLevel: ClassLevel;
  setClassLevel: (c: ClassLevel) => void;
  playerName: string;
  setPlayerName: (n: string) => void;
  unlockThresholds: { medium: number; hard: number };
  /** Static visual companion (no DB). */
  companionEmoji: string;
}

const AppContext = createContext<AppState | null>(null);

const CLASS_LEVEL_FIXED: ClassLevel = 8;

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");
  const [playerName, setPlayerNameState] = useState("");
  const [unlockThresholds, setUnlock] = useState({ medium: 50, hard: 150 });

  // Hydrate guest preferences
  useEffect(() => {
    if (typeof window === "undefined") return;
    const l = localStorage.getItem("ma_lang") as Lang | null;
    const p = localStorage.getItem("ma_player");
    if (l === "tr" || l === "de") setLangState(l);
    if (p) setPlayerNameState(p);
  }, []);

  // Load remote thresholds (public, anyone can read)
  useEffect(() => {
    supabase.from("settings").select("key,value").then(({ data }) => {
      if (!data) return;
      for (const row of data) {
        if (row.key === "unlock_thresholds") {
          const v = row.value as { medium?: number; hard?: number };
          setUnlock({ medium: v.medium ?? 50, hard: v.hard ?? 150 });
        }
      }
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("ma_lang", l);
  };
  const setPlayerName = (n: string) => {
    setPlayerNameState(n);
    if (typeof window !== "undefined") localStorage.setItem("ma_player", n);
  };
  // classLevel kept in the interface for compatibility but always 8.
  const setClassLevel = (_c: ClassLevel) => { /* no-op: app is 8. sınıf only */ };

  return (
    <AppContext.Provider value={{
      lang, setLang,
      classLevel: CLASS_LEVEL_FIXED, setClassLevel,
      playerName, setPlayerName,
      unlockThresholds,
      companionEmoji: "🦉",
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
