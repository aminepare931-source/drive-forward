import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingGrid } from "@/components/common/Loading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { assignmentsService } from "@/services/assignments";
import { questionsService } from "@/services/questions";
import { studentsService } from "@/services/students";
import { useOrg } from "@/lib/org";
import { dateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/assignments/$assignmentId")({
  head: () => ({
    meta: [
      { title: "Détail du devoir — DriveHub" },
      {
        name: "description",
        content:
          "Consultez les questions, les remises et les résultats d'un devoir de code de la route.",
      },
      { property: "og:title", content: "Détail du devoir — DriveHub" },
      { property: "og:description", content: "Questions, participants et résultats du devoir." },
    ],
  }),
  component: AssignmentDetail,
});

function AssignmentDetail() {
  const { assignmentId } = Route.useParams();
  const { orgId, role, studentId } = useOrg();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const assignment = useQuery({
    queryKey: ["assignment", orgId, assignmentId],
    queryFn: () => assignmentsService.get(orgId, assignmentId),
  });
  const questions = useQuery({
    queryKey: [
      "assignment-questions",
      orgId,
      assignmentId,
      assignment.data?.questionIds.length ?? 0,
    ],
    queryFn: () => questionsService.byIds(orgId, assignment.data?.questionIds ?? []),
    enabled: !!assignment.data,
  });
  const submissions = useQuery({
    queryKey: ["assignment-submissions", orgId, assignmentId],
    queryFn: () => assignmentsService.submissions(orgId, assignmentId),
  });
  const students = useQuery({
    queryKey: ["students-all", orgId],
    queryFn: () => studentsService.list(orgId, { pageSize: 500 }),
  });

  const mine = submissions.data?.find((s) => s.studentId === studentId) ?? null;

  const submit = useMutation({
    mutationFn: () => assignmentsService.submit(orgId, assignmentId, studentId ?? "", answers),
    onSuccess: (sub) => {
      toast.success(`Devoir remis — score ${sub.score}%`);
      qc.invalidateQueries({ queryKey: ["assignment-submissions", orgId, assignmentId] });
    },
  });

  if (assignment.isLoading) return <LoadingGrid />;
  const a = assignment.data;
  if (!a) return <p className="text-sm text-muted-foreground">Devoir introuvable.</p>;

  const isStudent = role === "student";
  const submitted = !!mine?.submittedAt;
  const graded = submissions.data?.filter((s) => s.submittedAt) ?? [];
  const nameOf = (id: string) => {
    const s = students.data?.items.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/assignments">
          <ArrowLeft className="mr-1 size-4" /> Retour aux devoirs
        </Link>
      </Button>

      <PageHeader
        title={a.title}
        description={`${a.description} • ${a.durationMin} min • échéance ${dateTime(a.dueAt)}`}
        actions={<StatusBadge status={a.status} />}
      />

      {isStudent ? (
        <Card>
          <CardHeader>
            <CardTitle>{submitted ? "Votre correction" : "Répondre au devoir"}</CardTitle>
            <CardDescription>
              {submitted
                ? `Remis le ${dateTime(mine!.submittedAt!)} — score ${mine!.score}%`
                : `${a.questionIds.length} questions`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(questions.data ?? []).map((q, index) => (
              <div key={q.id} className="rounded-xl border border-border/70 p-4">
                <p className="text-sm font-medium text-foreground">
                  {index + 1}. {q.text}
                </p>
                <RadioGroup
                  className="mt-3 space-y-2"
                  value={String(submitted ? (mine!.answers[q.id] ?? "") : (answers[q.id] ?? ""))}
                  onValueChange={(v) =>
                    !submitted && setAnswers((prev) => ({ ...prev, [q.id]: Number(v) }))
                  }
                >
                  {q.choices.map((choice, i) => (
                    <div
                      key={choice}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm",
                        submitted && i === q.correctIndex && "border-success/40 bg-success/10",
                        submitted &&
                          mine!.answers[q.id] === i &&
                          i !== q.correctIndex &&
                          "border-destructive/40 bg-destructive/10",
                      )}
                    >
                      <RadioGroupItem value={String(i)} id={`${q.id}-${i}`} disabled={submitted} />
                      <Label htmlFor={`${q.id}-${i}`} className="cursor-pointer font-normal">
                        {choice}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {submitted ? (
                  <p className="mt-3 text-xs text-muted-foreground">{q.explanation}</p>
                ) : null}
              </div>
            ))}

            {!submitted ? (
              <Button
                onClick={() => submit.mutate()}
                disabled={
                  submit.isPending || Object.keys(answers).length !== (questions.data?.length ?? 0)
                }
              >
                <CheckCircle2 className="mr-1 size-4" /> Remettre le devoir
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Remises</CardTitle>
              <CardDescription>
                {graded.length} / {submissions.data?.length ?? 0} élèves ont remis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress
                value={
                  submissions.data?.length ? (graded.length / submissions.data.length) * 100 : 0
                }
                className="mb-4 h-2"
              />
              {(submissions.data ?? []).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-2.5 text-sm"
                >
                  <span>{nameOf(s.studentId)}</span>
                  <span
                    className={
                      s.score === null
                        ? "text-muted-foreground"
                        : s.score >= 70
                          ? "font-semibold text-success"
                          : "font-semibold text-destructive"
                    }
                  >
                    {s.score === null ? "En attente" : `${s.score}%`}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>{a.questionIds.length} questions sélectionnées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(questions.data ?? []).map((q, i) => (
                <div key={q.id} className="rounded-lg border border-border/70 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {i + 1}. {q.text}
                  </p>
                  <p className="mt-1 text-xs text-success">Réponse : {q.choices[q.correctIndex]}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
