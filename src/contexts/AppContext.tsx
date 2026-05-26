import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
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
  // Gamification (persisted in Supabase for auth users, localStorage for guests)
  xp: number;
  coins: number;
  streakDays: number;
  companionEmoji: string;
  companionCharId: string;
  addXP: (n: number) => void;
  addCoins: (n: number) => void;
  refreshStreak: (newDays?: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");
  const [classLevel, setClassLevelState] = useState<ClassLevel>(8);
  const [playerName, setPlayerNameState] = useState("");
  const [unlockThresholds, setUnlock] = useState({ medium: 50, hard: 150 });
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(100);
  const [streakDays, setStreakDays] = useState(0);
  const [companionEmoji, setCompanionEmoji] = useState("🥚");
  const [companionCharId, setCompanionCharId] = useState("yumurtacan");
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  // Hydrate from localStorage (guest)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const l = localStorage.getItem("ma_lang") as Lang | null;
    const c = localStorage.getItem("ma_class");
    const p = localStorage.getItem("ma_player");
    if (l === "tr" || l === "de") setLangState(l);
    if (c === "3" || c === "8") setClassLevelState(Number(c) as ClassLevel);
    if (p) setPlayerNameState(p);
    // Guest gamification state
    const gXp = Number(localStorage.getItem("ma_xp") ?? 0);
    const gCoins = Number(localStorage.getItem("ma_coins") ?? 100);
    setXp(gXp); setCoins(gCoins);
  }, []);

  // Track auth session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthUserId(s?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setAuthUserId(data.session?.user?.id ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Load remote data for authenticated user
  useEffect(() => {
    if (!authUserId) return;
    let cancelled = false;

    // Wallet
    supabase.from("wallets").select("xp,coins").eq("user_id", authUserId).single()
      .then(({ data }) => { if (!cancelled && data) { setXp(data.xp); setCoins(data.coins); } });

    // Streak
    supabase.from("streaks").select("current_days").eq("user_id", authUserId).single()
      .then(({ data }) => { if (!cancelled && data) setStreakDays(data.current_days); });

    // Companion
    supabase.from("owned_characters").select("character_id,characters(emoji)")
      .eq("user_id", authUserId).eq("is_companion", true).single()
      .then(({ data }) => {
        if (!cancelled && data) {
          const char = data as { character_id: string; characters: { emoji: string } | null };
          if (char.characters?.emoji) setCompanionEmoji(char.characters.emoji);
          setCompanionCharId(char.character_id);
        }
      });

    // Remote settings
    supabase.from("settings").select("key,value")
      .then(({ data }) => {
        if (cancelled || !data) return;
        for (const row of data) {
          if (row.key === "active_class" && !localStorage.getItem("ma_class")) {
            const v = (row.value as { level?: number })?.level;
            if (v === 3 || v === 8) setClassLevelState(v as ClassLevel);
          }
          if (row.key === "unlock_thresholds") {
            const v = row.value as { medium?: number; hard?: number };
            setUnlock({ medium: v.medium ?? 50, hard: v.hard ?? 150 });
          }
        }
      });

    return () => { cancelled = true; };
  }, [authUserId]);

  // Guest: also load remote settings
  useEffect(() => {
    if (authUserId) return;
    supabase.from("settings").select("key,value").then(({ data }) => {
      if (!data) return;
      for (const row of data) {
        if (row.key === "active_class" && !localStorage.getItem("ma_class")) {
          const v = (row.value as { level?: number })?.level;
          if (v === 3 || v === 8) setClassLevelState(v as ClassLevel);
        }
        if (row.key === "unlock_thresholds") {
          const v = row.value as { medium?: number; hard?: number };
          setUnlock({ medium: v.medium ?? 50, hard: v.hard ?? 150 });
        }
      }
    });
  }, [authUserId]);

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

  const addXP = (n: number) => {
    const next = xp + n;
    setXp(next);
    if (authUserId) {
      supabase.from("wallets").update({ xp: next, updated_at: new Date().toISOString() }).eq("user_id", authUserId);
    } else {
      localStorage.setItem("ma_xp", String(next));
    }
  };

  const addCoins = (n: number) => {
    const next = Math.max(0, coins + n);
    setCoins(next);
    if (authUserId) {
      supabase.from("wallets").update({ coins: next, updated_at: new Date().toISOString() }).eq("user_id", authUserId);
    } else {
      localStorage.setItem("ma_coins", String(next));
    }
  };

  const refreshStreak = useCallback((newDays?: number) => {
    if (newDays !== undefined) { setStreakDays(newDays); return; }
    if (!authUserId) return;
    supabase.from("streaks").select("current_days").eq("user_id", authUserId).single()
      .then(({ data }) => { if (data) setStreakDays(data.current_days); });
  }, [authUserId]);

  return (
    <AppContext.Provider value={{
      lang, setLang, classLevel, setClassLevel, playerName, setPlayerName,
      unlockThresholds, xp, coins, streakDays, companionEmoji, companionCharId, addXP, addCoins, refreshStreak,
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
