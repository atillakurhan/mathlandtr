import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Plus, Copy, UserPlus } from "lucide-react";

export const Route = createFileRoute("/classroom")({
  component: ClassroomPage,
});

interface Classroom { id: string; name: string; invite_code: string; school: string | null }
interface Member { student_id: string; profiles: { display_name: string | null } | null }

function ClassroomPage() {
  const { lang } = useApp();
  const { user, isTeacher, loading } = useAuth();
  const nav = useNavigate();

  // Teacher state
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [selected, setSelected] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [newName, setNewName] = useState("");

  // Student state
  const [myClasses, setMyClasses] = useState<Classroom[]>([]);
  const [code, setCode] = useState("");

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);

  useEffect(() => {
    if (!user || loading) return;
    if (isTeacher) loadTeacherClasses();
    else loadStudentClasses();
  }, [user, isTeacher, loading]);

  async function loadTeacherClasses() {
    const { data } = await supabase.from("classrooms").select("*").eq("teacher_id", user!.id).order("created_at");
    if (data) setClasses(data as Classroom[]);
  }
  async function loadStudentClasses() {
    const { data } = await supabase
      .from("classroom_members")
      .select("classrooms(id,name,invite_code,school)")
      .eq("student_id", user!.id);
    if (data) setMyClasses(data.map((d) => d.classrooms as Classroom).filter(Boolean));
  }
  async function loadMembers(cls: Classroom) {
    setSelected(cls);
    const { data: memberData } = await supabase
      .from("classroom_members")
      .select("student_id")
      .eq("classroom_id", cls.id);
    if (!memberData) return;
    const ids = memberData.map((m) => m.student_id);
    if (ids.length === 0) { setMembers([]); return; }
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ids);
    const byId = new Map((profileData ?? []).map((p) => [p.id, p]));
    setMembers(ids.map((id) => ({ student_id: id, profiles: byId.get(id) ?? null })));
  }

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const { data, error } = await supabase.from("classrooms").insert({ teacher_id: user!.id, name: newName.trim() }).select().single();
    if (error) { toast.error(error.message); return; }
    setNewName("");
    toast.success(t("class_created", lang));
    await loadTeacherClasses();
    if (data) loadMembers(data as Classroom);
  }

  async function joinClass(e: React.FormEvent) {
    e.preventDefault();
    const { data: cls } = await supabase.from("classrooms").select("*").eq("invite_code", code.trim().toUpperCase()).single();
    if (!cls) { toast.error(t("invalid_code", lang)); return; }
    const { error } = await supabase.from("classroom_members").insert({ classroom_id: cls.id, student_id: user!.id });
    if (error && error.code !== "23505") { toast.error(error.message); return; }
    toast.success(t("class_joined", lang));
    setCode("");
    loadStudentClasses();
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">…</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">{t("classroom", lang)}</h1>
      </div>

      {isTeacher ? (
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Left — class list + create */}
          <div className="space-y-4">
            <form onSubmit={createClass} className="rounded-xl border border-border bg-card p-4 shadow-soft space-y-3">
              <h2 className="font-semibold text-sm flex items-center gap-2"><Plus className="h-4 w-4" />{t("create_class", lang)}</h2>
              <div>
                <Label className="text-xs">{t("class_name", lang)}</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="8a – Mathe" required />
              </div>
              <Button type="submit" size="sm" className="w-full">{t("create_class", lang)}</Button>
            </form>

            <div className="space-y-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => loadMembers(cls)}
                  className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${selected?.id === cls.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/60"}`}
                >
                  <p className="font-semibold">{cls.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{cls.invite_code}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right — selected class details */}
          {selected ? (
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground">{members.length} {t("students", lang)}</p>
                </div>
                <div className="text-center rounded-lg border border-border bg-secondary px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("your_invite_code", lang)}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-mono font-extrabold text-lg tracking-widest text-primary">{selected.invite_code}</span>
                    <button onClick={() => { navigator.clipboard.writeText(selected.invite_code); toast.success("Kopiert!"); }}>
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </div>
              </div>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Noch keine Schüler</p>
              ) : (
                <ul className="divide-y divide-border">
                  {members.map((m, i) => (
                    <li key={m.student_id} className="flex items-center gap-3 py-2 text-sm">
                      <span className="font-mono text-xs text-muted-foreground w-6">{i + 1}.</span>
                      <span className="font-medium">{m.profiles?.display_name ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
              Klasse auswählen oder erstellen
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-md space-y-6">
          {/* Join class */}
          <form onSubmit={joinClass} className="rounded-xl border border-border bg-card p-5 shadow-soft space-y-3">
            <h2 className="font-semibold flex items-center gap-2"><UserPlus className="h-4 w-4" />{t("join_class", lang)}</h2>
            <div>
              <Label className="text-xs">{t("invite_code", lang)}</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="font-mono tracking-widest text-center text-lg uppercase"
              />
            </div>
            <Button type="submit" className="w-full">{t("join_class", lang)}</Button>
          </form>

          {/* My classes */}
          {myClasses.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-semibold text-sm">{t("classroom", lang)}</h2>
              {myClasses.map((cls) => (
                <div key={cls.id} className="rounded-lg border border-border bg-card px-4 py-3">
                  <p className="font-semibold">{cls.name}</p>
                  {cls.school && <p className="text-xs text-muted-foreground">{cls.school}</p>}
                </div>
              ))}
            </div>
          )}
          {myClasses.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("no_classroom", lang)}</p>
          )}
        </div>
      )}
    </div>
  );
}
