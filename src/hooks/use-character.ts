import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface Character {
  id: string;
  name: string;
  price: number;
  ability_de: string | null;
  mentor_for_game: string | null;
  emoji: string;
  is_starter: boolean;
}

export interface OwnedCharacter {
  character_id: string;
  is_companion: boolean;
}

export function useCharacter() {
  const { user } = useAuth();
  const [all, setAll] = useState<Character[]>([]);
  const [owned, setOwned] = useState<OwnedCharacter[]>([]);
  const [companion, setCompanion] = useState<Character | null>(null);

  const loadAll = useCallback(async () => {
    const { data } = await supabase.from("characters").select("*").order("price");
    if (data) setAll(data as Character[]);
  }, []);

  const loadOwned = useCallback(async () => {
    if (!user) { setOwned([]); setCompanion(null); return; }
    const { data } = await supabase
      .from("owned_characters")
      .select("character_id,is_companion")
      .eq("user_id", user.id);
    if (data) {
      setOwned(data as OwnedCharacter[]);
      const comp = data.find((c) => c.is_companion);
      if (comp) {
        const char = all.find((c) => c.id === comp.character_id);
        setCompanion(char ?? null);
      }
    }
  }, [user, all]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { if (all.length > 0) loadOwned(); }, [loadOwned, all]);

  const setCompanionChar = useCallback(async (characterId: string) => {
    if (!user) return;
    await supabase.from("owned_characters").update({ is_companion: false }).eq("user_id", user.id);
    await supabase.from("owned_characters").update({ is_companion: true }).eq("user_id", user.id).eq("character_id", characterId);
    const char = all.find((c) => c.id === characterId);
    setCompanion(char ?? null);
    setOwned((prev) => prev.map((o) => ({ ...o, is_companion: o.character_id === characterId })));
  }, [user, all]);

  const isOwned = useCallback((id: string) => owned.some((o) => o.character_id === id), [owned]);

  return { all, owned, companion, isOwned, setCompanionChar, reload: loadOwned };
}
