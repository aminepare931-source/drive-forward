import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { assignmentsService } from "@/services/assignments";
import { groupsService } from "@/services/groups";
import { instructorsService } from "@/services/instructors";
import { questionsService } from "@/services/questions";
import { useOrg } from "@/lib/org";
import { dateTime } from "@/lib/format";
import { QUESTION_CATEGORIES } from "@/mocks/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/assignments/")({
  head: () => ({
    meta: [
      { title: "Devoirs — DriveHub" },
      {
        name: "description",
        content:
          "Créez, publiez et suivez les devoirs de code de la route assignés à vos élèves et groupes.",
      },
      { property: "og:title", content: "Devoirs — DriveHub" },
      { property: "og:description", content: "Devoirs publiés, échéances et taux de remise." },
    ],
  }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const { orgId, role, studentId, instructorId: sessionInstructorId } = useOrg();
  const qc = useQueryClient();
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [formStatus, setFormStatus] = useState<"draft" | "published">("draft");
  const [category, setCategory] = useState(QUESTION_CATEGORIES[0] ?? "");
  const [groupId, setGroupId] = useState("");
  const [instructorId, setInstructorId] = useState(sessionInstructorId ?? "");
  const [questionIds, setQuestionIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["assignments", orgId, status, role, studentId],
    queryFn: () =>
      assignmentsService.list(orgId, role === "student" && studentId ? { studentId } : { status }),
  });
  const groups = useQuery({
    queryKey: ["groups", orgId],
    queryFn: () => groupsService.list(orgId),
    enabled: open,
  });
  const instructors = useQuery({
    queryKey: ["instructors", orgId, ""],
    queryFn: () => instructorsService.list(orgId),
    enabled: open,
  });
  const questions = useQuery({
    queryKey: ["questions", orgId, "picker"],
    queryFn: () => questionsService.list(orgId),
    enabled: open,
  });

  const resetForm = () => {
    setDifficulty("medium");
    setFormStatus("draft");
    setCategory(QUESTION_CATEGORIES[0] ?? "");
    setGroupId("");
    setInstructorId(sessionInstructorId ?? "");
    setQuestionIds([]);
  };

  const create = useMutation({
    mutationFn: async (fd: FormData) => {
      const group = groups.data?.find((g) => g.id === groupId);
      if (!group) throw new Error("Groupe introuvable");
      return assignmentsService.create(orgId, {
        instructorId,
        title: String(fd.get("title")),
        description: String(fd.get("description")),
        category,
        difficulty,
        durationMin: Number(fd.get("durationMin")) || 20,
        attempts: Number(fd.get("attempts")) || 1,
        startAt: new Date(String(fd.get("startAt"))).toISOString(),
        dueAt: new Date(String(fd.get("dueAt"))).toISOString(),
        status: formStatus,
        questionIds,
        targetGroupId: group.id,
        targetStudentIds: group.studentIds,
      });
    },
    onSuccess: () => {
      toast.success("Devoir créé");
      setOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["assignments", orgId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
  });

  const form = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-1 size-4" /> Nouveau devoir
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border/70 px-6 py-5 pl-8 sm:px-8">
          <SheetTitle className="font-display text-xl">Créer un devoir</SheetTitle>
          <SheetDescription>Assigné à un groupe entier, avec sa banque de questions.</SheetDescription>
        </SheetHeader>

        <form
          id="new-assignment"
          className="flex-1 space-y-5 overflow-y-auto px-6 py-6 pl-8 sm:px-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!groupId) {
              toast.error("Sélectionnez le groupe ciblé.");
              return;
            }
            if (!instructorId) {
              toast.error("Sélectionnez le moniteur responsable.");
              return;
            }
            if (questionIds.length === 0) {
              toast.error("Sélectionnez au moins une question.");
              return;
            }
            create.mutate(new FormData(e.currentTarget));
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="a-title">Titre</Label>
            <Input id="a-title" name="title" placeholder="Ex. Révision priorités et intersections" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-desc">Description</Label>
            <Textarea id="a-desc" name="description" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="a-category">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="a-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-diff">Difficulté</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                <SelectTrigger id="a-diff">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="a-duration">Durée (min)</Label>
              <Input id="a-duration" name="durationMin" type="number" min={5} defaultValue={20} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-attempts">Tentatives autorisées</Label>
              <Input id="a-attempts" name="attempts" type="number" min={1} defaultValue={1} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-start">Ouverture</Label>
              <Input id="a-start" name="startAt" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-due">Échéance</Label>
              <Input id="a-due" name="dueAt" type="datetime-local" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="a-group">Groupe ciblé</Label>
              <Combobox
                id="a-group"
                allowCustom={false}
                options={(groups.data ?? []).map((g) => ({
                  value: g.id,
                  label: `${g.name} (${g.studentIds.length} élèves)`,
                }))}
                value={groupId}
                onChange={setGroupId}
                placeholder="Sélectionner un groupe"
                searchPlaceholder="Rechercher un groupe…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-instructor">Moniteur responsable</Label>
              <Combobox
                id="a-instructor"
                allowCustom={false}
                options={(instructors.data ?? []).map((i) => ({
                  value: i.id,
                  label: `${i.firstName} ${i.lastName}`,
                }))}
                value={instructorId}
                onChange={setInstructorId}
                placeholder="Sélectionner"
                searchPlaceholder="Rechercher un moniteur…"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="a-status">Statut</Label>
            <Select value={formStatus} onValueChange={(v) => setFormStatus(v as typeof formStatus)}>
              <SelectTrigger id="a-status" className="sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="published">Publié (notifie les élèves)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Questions ({questionIds.length} sélectionnée{questionIds.length > 1 ? "s" : ""})</Label>
            <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-border/70 bg-muted/20 p-2">
              {(questions.data ?? []).length === 0 ? (
                <p className="p-2 text-sm text-muted-foreground">
                  Aucune question dans la banque — ajoutez-en depuis la page Questions.
                </p>
              ) : (
                questions.data?.map((q) => {
                  const checked = questionIds.includes(q.id);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() =>
                        setQuestionIds((prev) =>
                          checked ? prev.filter((id) => id !== q.id) : [...prev, q.id],
                        )
                      }
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-md p-2 text-left text-sm transition-colors",
                        checked ? "bg-primary/10" : "hover:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                          checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
                        )}
                      >
                        {checked ? <Check className="size-3" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{q.text}</span>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {q.category}
                      </Badge>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </form>

        <SheetFooter className="border-t border-border/70 px-6 py-4 pl-8 sm:px-8">
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" form="new-assignment" disabled={create.isPending}>
            Créer le devoir
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  return (
    <div>
      <PageHeader
        title="Devoirs"
        description={
          role === "student"
            ? "Vos devoirs à réaliser."
            : "Suivi des devoirs publiés et des remises."
        }
        actions={
          role === "student" ? null : (
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
              {form}
            </div>
          )
        }
      />

      {isLoading ? (
        <LoadingGrid />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucun devoir"
          description="Aucun devoir ne correspond à ce filtre."
        />
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <Card key={a.id} className="transition-colors hover:border-primary/40">
              <CardContent className="p-5">
                <Link
                  to="/assignments/$assignmentId"
                  params={{ assignmentId: a.id }}
                  className="block"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{a.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {a.description}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span>{a.questionIds.length} questions</span>
                    <span>{a.durationMin} min</span>
                    <span>{a.attempts} tentative(s)</span>
                    <span>Échéance : {dateTime(a.dueAt)}</span>
                    <span>{a.targetStudentIds.length} élèves ciblés</span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
