import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CreditCard, FileText, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LoadingGrid } from "@/components/common/Loading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studentsService } from "@/services/students";
import {
  drivingService,
  paymentsService,
  documentsService,
  attendanceService,
} from "@/services/misc";
import { examsService } from "@/services/exams";
import { useOrg } from "@/lib/org";
import { date, dateTime, initials, money } from "@/lib/format";

export const Route = createFileRoute("/_shell/students/$studentId")({
  head: () => ({
    meta: [
      { title: "Dossier élève — DriveHub" },
      {
        name: "description",
        content:
          "Dossier complet de l'élève : progression, compétences, séances, examens, paiements et documents.",
      },
      { property: "og:title", content: "Dossier élève — DriveHub" },
      {
        property: "og:description",
        content: "Suivi pédagogique et administratif détaillé de l'élève.",
      },
    ],
  }),
  component: StudentDetail,
});

const SKILL_LABELS: Record<string, string> = {
  start: "Démarrage",
  braking: "Freinage",
  clutch: "Embrayage",
  gear: "Boîte de vitesses",
  parking: "Stationnement",
  reverse: "Marche arrière",
  hill_start: "Démarrage en côte",
  intersections: "Intersections",
  roundabouts: "Giratoires",
  lane_change: "Changement de voie",
  overtaking: "Dépassement",
  traffic: "Circulation dense",
};

function StudentDetail() {
  const { studentId } = Route.useParams();
  const { orgId } = useOrg();

  const student = useQuery({
    queryKey: ["student", orgId, studentId],
    queryFn: () => studentsService.get(orgId, studentId),
  });
  const timeline = useQuery({
    queryKey: ["student-timeline", orgId, studentId],
    queryFn: () => studentsService.timeline(orgId, studentId),
  });
  const sessions = useQuery({
    queryKey: ["student-sessions", orgId, studentId],
    queryFn: () => drivingService.list(orgId, { studentId }),
  });
  const payments = useQuery({
    queryKey: ["student-payments", orgId, studentId],
    queryFn: () => paymentsService.list(orgId, { studentId }),
  });
  const docs = useQuery({
    queryKey: ["student-docs", orgId, studentId],
    queryFn: () => documentsService.list(orgId, { studentId }),
  });
  const results = useQuery({
    queryKey: ["student-results", orgId, studentId],
    queryFn: () => examsService.results(orgId, { studentId }),
  });
  const attendance = useQuery({
    queryKey: ["student-attendance", orgId, studentId],
    queryFn: () => attendanceService.list(orgId, { studentId }),
  });

  if (student.isLoading) return <LoadingGrid />;
  const s = student.data;
  if (!s) return <p className="text-sm text-muted-foreground">Élève introuvable.</p>;

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/students">
          <ArrowLeft className="mr-1 size-4" /> Retour aux élèves
        </Link>
      </Button>

      <PageHeader
        title={`${s.firstName} ${s.lastName}`}
        description={`${s.email} • ${s.phone} • Catégorie ${s.category}`}
        actions={<StatusBadge status={s.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials(s.firstName, s.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-display text-lg font-bold text-foreground">
                  {s.firstName} {s.lastName}
                </p>
                <p className="text-xs text-muted-foreground">Inscrit le {date(s.enrolledAt)}</p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Naissance</dt>
                <dd>{date(s.birthDate)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Adresse</dt>
                <dd className="text-right">{s.address}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Heures de conduite</dt>
                <dd>
                  {s.drivingHours} / {s.requiredHours} h
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Moyenne</dt>
                <dd className="font-semibold">{s.average}%</dd>
              </div>
            </dl>

            <div className="mt-6 space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>Théorie</span>
                  <span>{s.theoryProgress}%</span>
                </div>
                <Progress value={s.theoryProgress} className="h-2" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>Pratique</span>
                  <span>{s.practiceProgress}%</span>
                </div>
                <Progress value={s.practiceProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="progress">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="progress">Progression</TabsTrigger>
            <TabsTrigger value="sessions">Conduite</TabsTrigger>
            <TabsTrigger value="exams">Examens</TabsTrigger>
            <TabsTrigger value="attendance">Présences</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Compétences de conduite</CardTitle>
                <CardDescription>Niveau évalué sur 4 par le moniteur</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {s.skills.map((skill) => (
                  <div key={skill.key}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-foreground">
                        {SKILL_LABELS[skill.key] ?? skill.key}
                      </span>
                      <span className="text-muted-foreground">{skill.level}/4</span>
                    </div>
                    <Progress value={(skill.level / 4) * 100} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Séances de conduite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(sessions.data ?? []).map((sess) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-muted-foreground" />
                      {dateTime(sess.start)}
                    </span>
                    <StatusBadge
                      status={
                        sess.status === "planned"
                          ? "in_use"
                          : sess.status === "done"
                            ? "completed"
                            : "expired"
                      }
                    />
                  </div>
                ))}
                {(sessions.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune séance planifiée.</p>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle>Résultats d'examens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(results.data ?? []).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="size-4 text-muted-foreground" />
                      {date(r.takenAt)}
                    </span>
                    <span
                      className={
                        r.passed ? "font-semibold text-success" : "font-semibold text-destructive"
                      }
                    >
                      {r.score}% — {r.passed ? "Réussi" : "Échoué"}
                    </span>
                  </div>
                ))}
                {(results.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun résultat enregistré.</p>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Présences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(attendance.data ?? []).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3 text-sm"
                  >
                    <span>{date(a.date)}</span>
                    <StatusBadge status={a.status === "late" ? "partial" : a.status} />
                  </div>
                ))}
                {(attendance.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune présence enregistrée.</p>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Paiements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(payments.data ?? []).map((p) => (
                  <div key={p.id} className="rounded-lg border border-border/70 px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <CreditCard className="size-4 text-muted-foreground" />
                        {money(p.paid)} / {money(p.total)}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                    <Progress value={(p.paid / p.total) * 100} className="mt-2 h-1.5" />
                  </div>
                ))}
                {(payments.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun paiement.</p>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(docs.data ?? []).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      {d.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {date(d.uploadedAt)} • {d.sizeKb} Ko
                    </span>
                  </div>
                ))}
                {(docs.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun document.</p>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Historique complet</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative space-y-4 border-l border-border pl-5">
                  {(timeline.data ?? []).map((entry) => (
                    <li key={entry.id} className="relative">
                      <span className="absolute -left-[27px] top-1.5 size-2.5 rounded-full bg-primary" />
                      <p className="text-sm font-medium text-foreground">{entry.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {dateTime(entry.at)} — {entry.detail}
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
