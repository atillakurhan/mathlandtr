import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shirt, Lock } from "lucide-react";

export const Route = createFileRoute("/wardrobe")({
  component: WardrobePage,
});

interface Item {
  id: string;
  slot: string;
  name_de: string;
  price: number;
  unlock_condition: string | null;
}

const SLOT_LABELS: Record<string, string> = {
  hat: "slot_hat",
  glasses: "slot_glasses",
  outfit: "slot_outfit",
  accessory: "slot_accessory",
};

function WardrobePage() {
  const { lang, coins, addCoins, streakDays } = useApp();
  const { user } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [activeSlot, setActiveSlot] = useState<string>("hat");

  useEffect(() => { if (!user) nav({ to: "/login" }); }, [user, nav]);

  useEffect(() => {
    supabase.from("wardrobe_items").select("*").order("slot").order("price")
      .then(({ data }) => { if (data) setItems(data as Item[]); });
    if (user) {
      supabase.from("owned_items").select("item_id").eq("user_id", user.id)
        .then(({ data }) => { if (data) setOwnedIds(new Set(data.map((d) => d.item_id))); });
    }
  }, [user]);

  function isUnlocked(item: Item): boolean {
    if (!item.unlock_condition) return true;
    const needed = Number(item.unlock_condition.replace("streak_", ""));
    return streakDays >= needed;
  }

  async function buy(item: Item) {
    if (!user || ownedIds.has(item.id)) return;
    if (!isUnlocked(item)) {
      const needed = Number(item.unlock_condition!.replace("streak_", ""));
      toast.error(t("unlock_with_streak", lang, { n: needed }));
      return;
    }
    if (item.price > 0 && coins < item.price) {
      toast.error(t("not_enough_coins", lang));
      return;
    }
    if (item.price > 0) {
      await supabase.from("wallets").update({ coins: coins - item.price }).eq("user_id", user.id);
      addCoins(-item.price);
    }
    await supabase.from("owned_items").insert({ user_id: user.id, item_id: item.id });
    setOwnedIds((prev) => new Set([...prev, item.id]));
    toast.success(`${item.name_de} ✓`);
  }

  const slots = ["hat", "glasses", "outfit", "accessory"];
  const filtered = items.filter((i) => i.slot === activeSlot);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shirt className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">{t("wardrobe", lang)}</h1>
        <span className="ml-auto text-sm font-semibold text-amber-600">🪙 {coins.toLocaleString()}</span>
      </div>

      {/* Slot tabs */}
      <div className="flex gap-2 mb-5 border-b border-border pb-3">
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSlot(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              activeSlot === s ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            {t(SLOT_LABELS[s] as Parameters<typeof t>[0], lang)}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const owned = ownedIds.has(item.id);
          const unlocked = isUnlocked(item);
          return (
            <div
              key={item.id}
              className={`rounded-xl border-2 p-4 flex items-center gap-3 ${
                owned ? "border-success bg-success/5" : "border-border bg-card"
              } ${!unlocked ? "opacity-60" : ""}`}
            >
              <div className="text-3xl">
                {!unlocked ? <Lock className="h-7 w-7 text-muted-foreground" /> : "🎽"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.name_de}</p>
                {item.unlock_condition ? (
                  <p className="text-[11px] text-muted-foreground">
                    {t("unlock_with_streak", lang, { n: item.unlock_condition.replace("streak_","") })}
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-600 font-bold">{item.price === 0 ? "Gratis" : `🪙 ${item.price}`}</p>
                )}
              </div>
              {!owned && unlocked && (
                <Button size="sm" onClick={() => buy(item)} disabled={item.price > 0 && coins < item.price}>
                  {item.price === 0 ? "Holen" : "Kaufen"}
                </Button>
              )}
              {owned && <span className="text-success text-xs font-bold">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
