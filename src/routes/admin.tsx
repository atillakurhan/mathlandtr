import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { GAMES, t, type GameId, type Lang } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Lock, BarChart2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

interface Q {
  id: string;
  game: string;
  class_level: number;
  difficulty: string;
  locale: string;
  prompt: string;
  answer_numeric: number | null;
}

function AdminPage() {
  const { lang, classLevel, unlockThresholds } = useApp();
  const { user, isTeacher, loading } = useAuth();
  const nav = useNavigate();

  const [game, setGame] = useState<GameId>("archery");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [locale, setLocale] = useState<Lang>(lang);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [items, setItems] = useState<Q[]>([]);
  const [thresholds, setThresholds] = useState(unlockThresholds);
  const [analytics, setAnalytics] = useState<{ player_name: string; total: number; best: number }[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => setThresholds(unlockThresholds), [unlockThresholds]);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  async function reload() {
    const { data } = await supabase
      .from("questions")
      .select("id, game, class_level, difficulty, locale, prompt, answer_numeric")
      .eq("game", game)
      .eq("class_level", classLevel)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Q[]);
  }
  useEffect(() => {
    if (user && isTeacher) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isTeacher, game, classLevel]);

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(answer);
    if (!prompt.trim() || Number.isNaN(num)) {
      toast.error(t("form_error", lang));
      return;
    }
    const { error } = await supabase.from("questions").insert({
      game,
      class_level: classLevel,
      difficulty,
      locale,
      prompt: prompt.trim(),
      answer_numeric: num,
      created_by: user?.id,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setPrompt("");
    setAnswer("");
    toast.success("✓");
    reload();
  }

  async function removeQuestion(id: string) {
    await supabase.from("questions").delete().eq("id", id);
    reload();
  }

  async function saveThresholds() {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "unlock_thresholds", value: thresholds });
    if (error) toast.error(error.message);
    else toast.success("✓");
  }

  async function loadAnalytics() {
    setAnalyticsLoading(true);
    const { data: scores } = await supabase
      .from("scores")
      .select("player_name, score")
      .eq("class_level", classLevel)
      .order("created_at", { ascending: false })
      .limit(500);
    if (!scores) { setAnalyticsLoading(false); return; }

    const map = new Map<string, { total: number; best: number }>();
    for (const s of scores) {
      const ex = map.get(s.player_name);
      if (ex) { ex.total += s.score; ex.best = Math.max(ex.best, s.score); }
      else map.set(s.player_name, { total: s.score, best: s.score });
    }
    const arr = [...map.entries()]
      .map(([player_name, v]) => ({ player_name, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    setAnalytics(arr);
    setAnalyticsLoading(false);
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">…</div>;
  if (!user) return null;
  if (!isTeacher)
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-muted-foreground">{t("teacher_only", lang)}</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{t("teacher_panel", lang)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("class_8", lang)}</p>
      </header>

      {/* Thresholds */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4" /> {t("unlock_thresholds", lang)}
        </h2>
        <div className="flex gap-2 items-end max-w-md">
          <div className="flex-1">
            <Label className="text-xs">{t("medium", lang)}</Label>
            <Input
              type="number"
              min={0}
              value={thresholds.medium}
              onChange={(e) => setThresholds({ ...thresholds, medium: Number(e.target.value) })}
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs">{t("hard", lang)}</Label>
            <Input
              type="number"
              min={0}
              value={thresholds.hard}
              onChange={(e) => setThresholds({ ...thresholds, hard: Number(e.target.value) })}
            />
          </div>
          <Button onClick={saveThresholds}>{t("save", lang)}</Button>
        </div>
      </section>

      {/* Question manager */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="font-semibold">{t("questions", lang)}</h2>
          <div className="ml-auto flex flex-wrap gap-2">
            <Select value={game} onValueChange={(v) => setGame(v as GameId)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {GAMES.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.emoji} {t(g.nameKey, lang)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as "easy" | "medium" | "hard")}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">{t("easy", lang)}</SelectItem>
                <SelectItem value="medium">{t("medium", lang)}</SelectItem>
                <SelectItem value="hard">{t("hard", lang)}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locale} onValueChange={(v) => setLocale(v as Lang)}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">TR</SelectItem>
                <SelectItem value="de">DE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <form onSubmit={addQuestion} className="grid gap-3 sm:grid-cols-[1fr_140px_auto] items-end">
          <div>
            <Label className="text-xs">{t("prompt", lang)}</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="z.B.  √144 = ?   /   5x + 3 = 18,  x = ?"
              required
            />
          </div>
          <div>
            <Label className="text-xs">{t("answer", lang)}</Label>
            <Input
              type="number"
              step="any"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
          </div>
          <Button type="submit"><Plus className="h-4 w-4 mr-1" />{t("add_question", lang)}</Button>
        </form>

        <ul className="mt-5 divide-y divide-border">
          {items.length === 0 && (
            <li className="py-4 text-sm text-muted-foreground">{t("no_questions", lang)}</li>
          )}
          {items.map((q) => (
            <li key={q.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="rounded bg-secondary px-1.5 py-0.5 text-xs uppercase">{q.locale}</span>
              <span className="rounded bg-accent/30 px-1.5 py-0.5 text-xs">{t(q.difficulty as "easy" | "medium" | "hard", lang)}</span>
              <span className="flex-1 truncate">{q.prompt}</span>
              <span className="font-mono text-primary">= {q.answer_numeric}</span>
              <Button size="icon" variant="ghost" onClick={() => removeQuestion(q.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {/* Student analytics */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <BarChart2 className="h-4 w-4" /> {t("student_analytics", lang)}
          </h2>
          <Button size="sm" variant="outline" onClick={loadAnalytics} disabled={analyticsLoading}>
            {analyticsLoading ? "…" : t("top_students", lang)}
          </Button>
        </div>
        {analytics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 w-8">{t("rank", lang)}</th>
                  <th className="pb-2">{t("player", lang)}</th>
                  <th className="pb-2 text-right">{t("high_score", lang)}</th>
                  <th className="pb-2 text-right">{t("total_score", lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.map((row, i) => (
                  <tr key={row.player_name} className="py-1">
                    <td className="py-2 font-mono text-muted-foreground">{i + 1}.</td>
                    <td className="py-2 font-medium truncate max-w-[160px]">{row.player_name}</td>
                    <td className="py-2 text-right text-accent-foreground/80 tabular-nums">{row.best}</td>
                    <td className="py-2 text-right font-bold text-primary tabular-nums">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {analyticsLoading ? "…" : t("no_scores", lang)}
          </p>
        )}
      </section>
    </div>
  );
}
