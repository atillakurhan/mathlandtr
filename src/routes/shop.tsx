import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/use-auth";
import { useCharacter, type Character } from "@/hooks/use-character";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingBag, CheckCircle2, Star } from "lucide-react";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});

function ShopPage() {
  const { lang, coins, addCoins } = useApp();
  const { user } = useAuth();
  const nav = useNavigate();
  const { all, owned, isOwned, setCompanionChar, reload } = useCharacter();

  useEffect(() => {
    if (!user) nav({ to: "/login" });
  }, [user, nav]);

  async function buy(char: Character) {
    if (isOwned(char.id)) {
      await setCompanionChar(char.id);
      toast.success(`${char.emoji} ${char.name} — ${t("equip_companion", lang)}`);
      return;
    }
    if (coins < char.price) {
      toast.error(t("not_enough_coins", lang));
      return;
    }
    // Deduct coins
    const next = coins - char.price;
    await supabase.from("wallets").update({ coins: next, updated_at: new Date().toISOString() }).eq("user_id", user!.id);
    addCoins(-char.price);
    // Record ownership
    await supabase.from("owned_characters").insert({ user_id: user!.id, character_id: char.id, is_companion: false });
    await setCompanionChar(char.id);
    await reload();
    toast.success(`${char.emoji} ${char.name} ${t("buy_char", lang)} ✓`);
  }

  const companion = owned.find((o) => o.is_companion);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">{t("shop", lang)}</h1>
        <span className="ml-auto text-sm font-semibold text-amber-600">🪙 {coins.toLocaleString()} {t("coins", lang)}</span>
      </div>

      {companion && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex items-center gap-3 text-sm font-medium">
          <span className="text-3xl">{all.find((c) => c.id === companion.character_id)?.emoji}</span>
          <div>
            <p className="text-xs text-muted-foreground">{t("your_companion", lang)}</p>
            <p className="font-bold">{all.find((c) => c.id === companion.character_id)?.name}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {all.map((char) => {
          const owned_ = isOwned(char.id);
          const isComp = companion?.character_id === char.id;
          return (
            <div
              key={char.id}
              className={`relative rounded-2xl border-2 bg-card p-5 flex flex-col items-center gap-3 shadow-soft transition-all ${
                isComp ? "border-primary shadow-card" : "border-border hover:border-primary/40"
              }`}
            >
              {isComp && (
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  Begleiter
                </span>
              )}
              <div className="text-6xl drop-shadow">{char.emoji}</div>
              <div className="text-center">
                <h3 className="font-bold text-base">{char.name}</h3>
                {char.ability_de && (
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{char.ability_de}</p>
                )}
              </div>
              <div className="mt-auto w-full">
                {owned_ ? (
                  <Button
                    variant={isComp ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={() => buy(char)}
                    disabled={isComp}
                  >
                    {isComp ? (
                      <><CheckCircle2 className="h-4 w-4 mr-1" /> Aktiv</>
                    ) : (
                      <><Star className="h-4 w-4 mr-1" />{t("equip_companion", lang)}</>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => buy(char)}
                    disabled={char.price > 0 && coins < char.price}
                  >
                    {char.price === 0
                      ? t("free_starter", lang)
                      : `🪙 ${char.price} — ${t("buy_char", lang)}`}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
