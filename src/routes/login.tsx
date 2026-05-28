import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "signin" | "signup_student" | "signup_teacher";

function LoginPage() {
  const { lang } = useApp();
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode !== "signin";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (!isSignup) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/" });
      } else {
        const role = mode === "signup_teacher" ? "teacher" : "student";
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0], role },
          },
        });
        if (error) throw error;
        toast.success("Registrierung erfolgreich!");
        nav({ to: "/" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        {/* Role tabs */}
        <div className="flex gap-1 rounded-lg border border-border bg-secondary p-1 mb-5 text-xs font-semibold">
          {([
            ["signin",          "Anmelden"],
            ["signup_student",  t("i_am_student", lang)],
            ["signup_teacher",  t("i_am_teacher", lang)],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded px-2 py-1.5 transition-colors ${mode === m ? "bg-primary text-primary-foreground shadow-soft" : "hover:bg-background"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {isSignup && (
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("display_name", lang)}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Max Mustermann" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email", lang)}</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="max@schule.de" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">{t("password", lang)}</Label>
            <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {mode === "signup_student" && (
            <div className="space-y-1.5">
              <Label htmlFor="code">{t("optional_code", lang)}</Label>
              <Input
                id="code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="font-mono tracking-widest uppercase"
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signin" ? "Anmelden" : isSignup ? "Registrieren" : ""}
          </Button>
        </form>
      </div>
    </div>
  );
}
