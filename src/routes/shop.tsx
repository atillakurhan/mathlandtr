import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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

const ABILITY_TR: Record<string, string> = {
  yumurtacan:  "2. denemede doğru cevabı gösterir 💡",
  abuzer:      "Geometri sorularında +%20 münzen 📐",
  abuzeriye:   "Her doğru cevapta +2 XP bonus ⚡",
  mango:       "Kesir sorularında +%20 münzen 🍰",
  pirasa:      "Zamanlı oyunlarda +15 saniye ⏱️",
  susi:        "Yanlış cevapta puan kesilmez 🛡️",
  tursuctacan: "Veri sorularında ekstra ipucu 📊",
};

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
        <div className="mb-6 rounded-2xl border-2 border-primary bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4 flex items-center gap-4">
          <span className="text-5xl">{all.find((c) => c.id === companion.character_id)?.emoji}</span>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">{t("your_companion", lang)}</p>
            <p className="font-extrabold text-lg">{all.find((c) => c.id === companion.character_id)?.name}</p>
            <p className="text-xs text-primary font-medium mt-0.5">
              {ABILITY_TR[companion.character_id] ?? all.find((c) => c.id === companion.character_id)?.ability_de ?? ""}
            </p>
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
              className={`relative rounded-2xl border-2 bg-card overflow-hidden shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5 ${
                isComp
                  ? "border-primary shadow-card ring-2 ring-primary/30"
                  : owned_
                  ? "border-primary/40"
                  : "border-border"
              }`}
            >
              {/* Top gradient band */}
              <div className={`h-28 flex items-center justify-center relative ${
                char.price === 0 ? "bg-gradient-to-br from-emerald-400 to-teal-500" :
                char.price <= 350 ? "bg-gradient-to-br from-sky-400 to-blue-500" :
                char.price <= 450 ? "bg-gradient-to-br from-violet-500 to-purple-600" :
                "bg-gradient-to-br from-amber-400 to-orange-500"
              }`}>
                <span className="text-7xl drop-shadow-lg filter">{char.emoji}</span>
                {isComp && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold bg-white text-primary px-2 py-0.5 rounded-full shadow">
                    ✓ Aktif
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-extrabold text-base mb-1">{char.name}</h3>
                {/* Ability in current language */}
                <p className="text-xs text-muted-foreground leading-snug mb-3 min-h-[2.5rem]">
                  {lang === "tr" ? (ABILITY_TR[char.id] ?? char.ability_de ?? "—") : (char.ability_de ?? "—")}
                </p>

                {/* Price badge */}
                {char.price > 0 && !owned_ && (
                  <div className="mb-3 flex items-center gap-1 text-xs font-bold text-amber-600">
                    <span className="text-base">🪙</span> {char.price}
                    {coins < char.price && <span className="text-destructive ml-1">({t("not_enough_coins", lang)})</span>}
                  </div>
                )}
                {char.price === 0 && !owned_ && (
                  <div className="mb-3 text-xs font-bold text-emerald-600">🎁 Ücretsiz başlangıç karakteri</div>
                )}
                {owned_ && (
                  <div className="mb-3 text-xs font-bold text-primary">✓ Sahip olduğun karakter</div>
                )}

                <Button
                  variant={isComp ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => buy(char)}
                  disabled={isComp || (!owned_ && char.price > 0 && coins < char.price)}
                >
                  {isComp ? (
                    <><CheckCircle2 className="h-4 w-4 mr-1" /> Aktif Arkadaş</>
                  ) : owned_ ? (
                    <><Star className="h-4 w-4 mr-1" />{t("equip_companion", lang)}</>
                  ) : char.price === 0 ? (
                    t("free_starter", lang)
                  ) : (
                    `🪙 ${char.price} — ${t("buy_char", lang)}`
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
