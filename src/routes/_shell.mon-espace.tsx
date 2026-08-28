import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ClipboardList, GraduationCap, Gauge, Car } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingStats } from "@/components/common/Loading";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dashboardService } from "@/services/dashboard";
import { useOrg } from "@/lib/org";
import { date, dateTime } from "@/lib/format";

export const Route = createFileRoute("/_shell/mon-espace")({
  head: () => ({
    meta: [
      { title: "Mon espace élève — DriveHub" },
      {
        name: "description",
        content:
          "Progression théorique et pratique, devoirs à rendre, prochaine séance de conduite et résultats d'examens de l'élève.",
      },
      { property: "og:title", content: "Mon espace élève — DriveHub" },
      {
        property: "og:description",
        content: "Votre progression, vos devoirs et vos prochaines échéances de formation.",
      },
    ],
  }),
  component: StudentSpacePage,
});

function StudentSpacePage() {
  const { orgId, studentId, session } = useOrg();
  const { data, isLoading } = useQuery({
    queryKey: ["student-space", orgId, studentId],
    queryFn: () => dashboardService.student(orgId, studentId!),
    enabled: Boolean(studentId),
  });

  if (!studentId) {
    return (
      <div>
        <PageHeader title="Mon espace" />
        <EmptyState
          icon={GraduationCap}
          title="Espace réservé aux élèves"
          description="Connectez-vous avec un compte élève pour accéder à cette page."
        />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title="Mon espace" description="Votre progression de formation." />
        <LoadingStats />
      </div>
    );
  }

  const student = data.student;
  const passed = data.results.filter((r) => r.passed).length;

  return (
    <div>
      <PageHeader
        title={`Bonjour ${session.user.firstName}`}
        description="Voici l'essentiel de votre formation."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Progression globale"
          value={`${data.overall}%`}
          icon={Gauge}
          tone="accent"
        />
        <StatCard
          label="Devoirs à rendre"
          value={data.pendingAssignments.length}
          icon={ClipboardList}
          tone={data.pendingAssignments.length ? "destructive" : "success"}
        />
        <StatCard
          label="Examens réussis"
          value={`${passed}/${data.results.length}`}
          icon={GraduationCap}
          tone="success"
        />
        <StatCard
          label="Heures de conduite"
          value={`${student?.drivingHours ?? 0} h`}
          hint={`sur ${student?.requiredHours ?? 0} h requises`}
          icon={Car}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Ma progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Théorie (code)</span>
                <span className="font-medium">{student?.theoryProgress ?? 0}%</span>
              </div>
              <Progress value={student?.theoryProgress ?? 0} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Pratique (conduite)</span>
                <span className="font-medium">{student?.practiceProgress ?? 0}%</span>
              </div>
              <Progress value={student?.practiceProgress ?? 0} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Heures effectuées</span>
                <span className="font-medium">
                  {student?.drivingHours ?? 0} / {student?.requiredHours ?? 0} h
                </span>
              </div>
              <Progress
                value={
                  student && student.requiredHours
                    ? Math.min(100, (student.drivingHours / student.requiredHours) * 100)
                    : 0
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prochaine séance</CardTitle>
          </CardHeader>
          <CardContent>
            {data.nextSession ? (
              <div className="space-y-2">
                <p className="font-display text-xl font-bold">{dateTime(data.nextSession.start)}</p>
                <p className="text-sm text-muted-foreground">
                  Fin prévue à {dateTime(data.nextSession.end)}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/planning">Voir le planning</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune séance planifiée pour le moment.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Devoirs à rendre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.pendingAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun devoir en attente. Bravo !</p>
            ) : (
              data.pendingAssignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      À rendre avant le {date(a.dueAt)}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/assignments/$assignmentId" params={{ assignmentId: a.id }}>
                      Commencer
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prochaines échéances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Rien de prévu pour l'instant.</p>
            ) : (
              data.upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-lg border border-border/70 p-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarDays className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{dateTime(e.start)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
