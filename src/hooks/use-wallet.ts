import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface Wallet { xp: number; coins: number }

const EMPTY: Wallet = { xp: 0, coins: 0 };

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet>(EMPTY);

  const load = useCallback(async () => {
    if (!user) { setWallet(EMPTY); return; }
    const { data } = await supabase.from("wallets").select("xp,coins").eq("user_id", user.id).single();
    if (data) setWallet({ xp: data.xp, coins: data.coins });
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addXP = useCallback(async (amount: number) => {
    if (!user || amount <= 0) return;
    await supabase.from("wallets").update({ xp: wallet.xp + amount, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    setWallet((w) => ({ ...w, xp: w.xp + amount }));
  }, [user, wallet.xp]);

  const addCoins = useCallback(async (amount: number) => {
    if (!user) return;
    const next = Math.max(0, wallet.coins + amount);
    await supabase.from("wallets").update({ coins: next, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    setWallet((w) => ({ ...w, coins: next }));
  }, [user, wallet.coins]);

  const spendCoins = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || wallet.coins < amount) return false;
    const next = wallet.coins - amount;
    const { error } = await supabase.from("wallets").update({ coins: next, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    if (error) return false;
    setWallet((w) => ({ ...w, coins: next }));
    return true;
  }, [user, wallet.coins]);

  return { wallet, addXP, addCoins, spendCoins, reload: load };
}
