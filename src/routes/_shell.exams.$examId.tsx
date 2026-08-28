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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { examsService } from "@/services/exams";
import { questionsService } from "@/services/questions";
import { studentsService } from "@/services/students";
import { useOrg } from "@/lib/org";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/_shell/exams/$examId")({
  head: () => ({
    meta: [
      { title: "Session d'examen — DriveHub" },
      {
        name: "description",
        content:
          "Détail d'une session d'examen : questions, participants, scores et taux de réussite.",
      },
      { property: "og:title", content: "Session d'examen — DriveHub" },
      { property: "og:description", content: "Questions et résultats de la session d'examen." },
    ],
  }),
  component: ExamDetail,
});

function ExamDetail() {
  const { examId } = Route.useParams();
  const { orgId, role, studentId } = useOrg();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const exam = useQuery({
    queryKey: ["exam", orgId, examId],
    queryFn: () => examsService.get(orgId, examId),
  });
  const questions = useQuery({
    queryKey: ["exam-questions", orgId, examId, exam.data?.questionIds.length ?? 0],
    queryFn: () => questionsService.byIds(orgId, exam.data?.questionIds ?? []),
    enabled: !!exam.data,
  });
  const results = useQuery({
    queryKey: ["exam-results", orgId, examId],
    queryFn: () => examsService.results(orgId, { examId }),
  });
  const students = useQuery({
    queryKey: ["students-all", orgId],
    queryFn: () => studentsService.list(orgId, { pageSize: 500 }),
  });

  const submit = useMutation({
    mutationFn: () => examsService.submit(orgId, examId, studentId ?? "", answers),
    onSuccess: (r) => {
      toast[r.passed ? "success" : "error"](
        `Score ${r.score}% — ${r.passed ? "réussi" : "échoué"}`,
      );
      qc.invalidateQueries({ queryKey: ["exam-results", orgId, examId] });
    },
  });

  if (exam.isLoading) return <LoadingGrid />;
  const e = exam.data;
  if (!e) return <p className="text-sm text-muted-foreground">Examen introuvable.</p>;

  const mine = results.data?.find((r) => r.studentId === studentId) ?? null;
  const nameOf = (id: string) => {
    const s = students.data?.items.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/exams">
          <ArrowLeft className="mr-1 size-4" /> Retour aux examens
        </Link>
      </Button>

      <PageHeader
        title={e.title}
        description={`${dateTime(e.date)} • ${e.durationMin} min • ${e.questionIds.length} questions`}
        actions={<StatusBadge status={e.status} />}
      />

      {role === "student" ? (
        <Card>
          <CardHeader>
            <CardTitle>{mine ? "Votre résultat" : "Passer l'examen blanc"}</CardTitle>
            <CardDescription>
              {mine
                ? `${mine.score}% — ${mine.passed ? "réussi" : "échoué"}`
                : "Sélectionnez une réponse par question."}
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
                  value={String(answers[q.id] ?? "")}
                  onValueChange={(v) =>
                    !mine && setAnswers((prev) => ({ ...prev, [q.id]: Number(v) }))
                  }
                >
                  {q.choices.map((choice, i) => (
                    <div key={choice} className="flex items-center gap-3 text-sm">
                      <RadioGroupItem value={String(i)} id={`${q.id}-${i}`} disabled={!!mine} />
                      <Label htmlFor={`${q.id}-${i}`} className="cursor-pointer font-normal">
                        {choice}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {mine ? (
                  <p className="mt-3 text-xs text-success">
                    Bonne réponse : {q.choices[q.correctIndex]}
                  </p>
                ) : null}
              </div>
            ))}
            {!mine ? (
              <Button
                onClick={() => submit.mutate()}
                disabled={
                  submit.isPending || Object.keys(answers).length !== (questions.data?.length ?? 0)
                }
              >
                <CheckCircle2 className="mr-1 size-4" /> Valider mes réponses
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Résultats</CardTitle>
              <CardDescription>{results.data?.length ?? 0} candidats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(results.data ?? []).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-2.5 text-sm"
                >
                  <span>{nameOf(r.studentId)}</span>
                  <span
                    className={
                      r.passed ? "font-semibold text-success" : "font-semibold text-destructive"
                    }
                  >
                    {r.score}%
                  </span>
                </div>
              ))}
              {(results.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun résultat pour le moment.</p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
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
