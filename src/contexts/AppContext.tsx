import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang, ClassLevel } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  classLevel: ClassLevel;
  setClassLevel: (c: ClassLevel) => void;
  playerName: string;
  setPlayerName: (n: string) => void;
  unlockThresholds: { medium: number; hard: number };
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");
  const [classLevel, setClassLevelState] = useState<ClassLevel>(3);
  const [playerName, setPlayerNameState] = useState("");
  const [unlockThresholds, setUnlock] = useState({ medium: 50, hard: 150 });

  // hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const l = localStorage.getItem("ma_lang") as Lang | null;
    const c = localStorage.getItem("ma_class");
    const p = localStorage.getItem("ma_player");
    if (l === "tr" || l === "de") setLangState(l);
    if (c === "3" || c === "8") setClassLevelState(Number(c) as ClassLevel);
    if (p) setPlayerNameState(p);
  }, []);

  // load remote settings (active class + thresholds)
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("settings")
      .select("key, value")
      .then(({ data }) => {
        if (cancelled || !data) return;
        for (const row of data) {
          if (row.key === "active_class" && typeof window !== "undefined") {
            // only honor remote class if user hasn't picked one locally yet
            if (!localStorage.getItem("ma_class")) {
              const v = (row.value as { level?: number })?.level;
              if (v === 3 || v === 8) setClassLevelState(v as ClassLevel);
            }
          }
          if (row.key === "unlock_thresholds") {
            const v = row.value as { medium?: number; hard?: number };
            setUnlock({ medium: v.medium ?? 50, hard: v.hard ?? 150 });
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("ma_lang", l);
  };
  const setClassLevel = (c: ClassLevel) => {
    setClassLevelState(c);
    if (typeof window !== "undefined") localStorage.setItem("ma_class", String(c));
  };
  const setPlayerName = (n: string) => {
    setPlayerNameState(n);
    if (typeof window !== "undefined") localStorage.setItem("ma_player", n);
  };

  return (
    <AppContext.Provider
      value={{ lang, setLang, classLevel, setClassLevel, playerName, setPlayerName, unlockThresholds }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
