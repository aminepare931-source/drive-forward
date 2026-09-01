import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, GraduationCap, Plus } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
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
import { examsService } from "@/services/exams";
import { groupsService } from "@/services/groups";
import { questionsService } from "@/services/questions";
import { useOrg } from "@/lib/org";
import { dateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/exams/")({
  head: () => ({
    meta: [
      { title: "Examens blancs — DriveHub" },
      {
        name: "description",
        content:
          "Planifiez et suivez les examens théoriques et pratiques : sessions, résultats et taux de réussite.",
      },
      { property: "og:title", content: "Examens blancs — DriveHub" },
      {
        property: "og:description",
        content: "Sessions d'examens, participants et taux de réussite.",
      },
    ],
  }),
  component: ExamsPage,
});

function ExamsPage() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"theory" | "practice">("theory");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [groupId, setGroupId] = useState("");
  const [questionIds, setQuestionIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["exams", orgId],
    queryFn: () => examsService.list(orgId),
  });
  const groups = useQuery({
    queryKey: ["groups", orgId],
    queryFn: () => groupsService.list(orgId),
    enabled: open,
  });
  const questions = useQuery({
    queryKey: ["questions", orgId, "picker"],
    queryFn: () => questionsService.list(orgId),
    enabled: open,
  });

  const resetForm = () => {
    setType("theory");
    setStatus("draft");
    setGroupId("");
    setQuestionIds([]);
  };

  const create = useMutation({
    mutationFn: (input: {
      title: string;
      type: "theory" | "practice";
      date: string;
      durationMin: number;
      questionIds: string[];
      groupId?: string;
      status: "draft" | "published";
    }) => examsService.create(orgId, input),
    onSuccess: () => {
      toast.success("Examen planifié");
      setOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["exams", orgId] });
    },
  });

  const form = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-1 size-4" /> Planifier un examen
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border/70 px-6 py-5 pl-8 sm:px-8">
          <SheetTitle className="font-display text-xl">Planifier un examen</SheetTitle>
          <SheetDescription>Session théorique ou pratique, avec sa banque de questions.</SheetDescription>
        </SheetHeader>

        <form
          id="new-exam"
          className="flex-1 space-y-5 overflow-y-auto px-6 py-6 pl-8 sm:px-8"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (type === "theory" && questionIds.length === 0) {
              toast.error("Sélectionnez au moins une question pour un examen théorique.");
              return;
            }
            create.mutate({
              title: String(fd.get("title")),
              type,
              date: new Date(String(fd.get("date"))).toISOString(),
              durationMin: Number(fd.get("durationMin")) || 30,
              questionIds,
              status,
              ...(groupId ? { groupId } : {}),
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="e-title">Titre</Label>
            <Input id="e-title" name="title" placeholder="Ex. Examen blanc code — session 3" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="e-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger id="e-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Théorie</SelectItem>
                  <SelectItem value="practice">Pratique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-date">Date</Label>
              <Input id="e-date" name="date" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-duration">Durée (min)</Label>
              <Input id="e-duration" name="durationMin" type="number" min={10} defaultValue={30} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="e-group">Groupe (facultatif)</Label>
              <Combobox
                id="e-group"
                allowCustom={false}
                options={(groups.data ?? []).map((g) => ({ value: g.id, label: g.name }))}
                value={groupId}
                onChange={setGroupId}
                placeholder="Tous les élèves"
                searchPlaceholder="Rechercher un groupe…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-status">Statut</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger id="e-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "theory" ? (
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
          ) : null}
        </form>

        <SheetFooter className="border-t border-border/70 px-6 py-4 pl-8 sm:px-8">
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" form="new-exam" disabled={create.isPending}>
            Planifier
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  return (
    <div>
      <PageHeader title="Examens" description="Sessions théoriques et pratiques." actions={form} />
      {isLoading ? (
        <LoadingGrid />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Aucun examen"
          description="Planifiez une première session d'examen."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((e) => (
            <Card key={e.id} className="transition-colors hover:border-primary/40">
              <CardContent className="p-5">
                <Link to="/exams/$examId" params={{ examId: e.id }} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{e.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {dateTime(e.date)} • {e.durationMin} min
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={e.status} />
                      <Badge variant="secondary">
                        {e.type === "theory" ? "Théorie" : "Pratique"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs">
                      <span>Taux de réussite</span>
                      <span>{e.passRate}%</span>
                    </div>
                    <Progress value={e.passRate} className="h-2" />
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
