import { useApp } from "@/contexts/AppContext";
import { Coins, Zap } from "lucide-react";

export function WalletBar() {
  const { xp, coins } = useApp();
  return (
    <div className="flex items-center gap-2 text-xs font-bold">
      <span className="flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-1 border border-amber-200">
        <Coins className="h-3.5 w-3.5" />
        {coins.toLocaleString()}
      </span>
      <span className="flex items-center gap-1 rounded-full bg-violet-100 text-violet-700 px-2 py-1 border border-violet-200">
        <Zap className="h-3.5 w-3.5" />
        {xp.toLocaleString()} XP
      </span>
    </div>
  );
}
