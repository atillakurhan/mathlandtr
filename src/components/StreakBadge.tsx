import { useApp } from "@/contexts/AppContext";
import { Flame } from "lucide-react";

export function StreakBadge() {
  const { streakDays } = useApp();
  if (streakDays === 0) return null;
  const color =
    streakDays >= 30 ? "bg-rose-500 text-white border-rose-600" :
    streakDays >= 14 ? "bg-orange-400 text-white border-orange-500" :
    streakDays >= 7  ? "bg-amber-400 text-white border-amber-500" :
                       "bg-amber-100 text-amber-700 border-amber-200";
  return (
    <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold border ${color}`}>
      <Flame className="h-3.5 w-3.5" />
      {streakDays}
    </span>
  );
}
