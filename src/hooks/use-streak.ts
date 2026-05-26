import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface Streak {
  current_days: number;
  longest_days: number;
  last_activity_date: string | null;
}

const EMPTY: Streak = { current_days: 0, longest_days: 0, last_activity_date: null };

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak>(EMPTY);

  const load = useCallback(async () => {
    if (!user) { setStreak(EMPTY); return; }
    const { data } = await supabase
      .from("streaks")
      .select("current_days,longest_days,last_activity_date")
      .eq("user_id", user.id)
      .single();
    if (data) setStreak(data as Streak);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const recordActivity = useCallback(async (): Promise<{ coinBonus: number; newStreak: number }> => {
    if (!user) return { coinBonus: 0, newStreak: 0 };

    const today = new Date().toISOString().split("T")[0];
    if (streak.last_activity_date === today) return { coinBonus: 0, newStreak: streak.current_days };

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const continued = streak.last_activity_date === yesterday;
    const newCurrent = continued ? streak.current_days + 1 : 1;
    const newLongest = Math.max(streak.longest_days, newCurrent);

    await supabase.from("streaks").update({
      current_days: newCurrent,
      longest_days: newLongest,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    setStreak({ current_days: newCurrent, longest_days: newLongest, last_activity_date: today });

    // Milestone coin rewards
    let coinBonus = 0;
    if (newCurrent === 3)  coinBonus = 50;
    if (newCurrent === 7)  coinBonus = 150;
    if (newCurrent === 14) coinBonus = 200;
    if (newCurrent === 30) coinBonus = 500;

    return { coinBonus, newStreak: newCurrent };
  }, [user, streak]);

  return { streak, recordActivity, reload: load };
}
