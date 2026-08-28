import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { LoadingStats } from "@/components/common/Loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { dashboardService } from "@/services/dashboard";
import { useOrg } from "@/lib/org";
import { dateTime, money } from "@/lib/format";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — DriveHub" },
      {
        name: "description",
        content:
          "Vue d'ensemble de l'activité de votre auto-école : élèves, séances, examens et encaissements.",
      },
      { property: "og:title", content: "Tableau de bord — DriveHub" },
      {
        property: "og:description",
        content: "Indicateurs clés et activité récente de votre auto-école.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { orgId, role, instructorId } = useOrg();
  return role === "instructor" ? (
    <InstructorDashboard orgId={orgId} instructorId={instructorId ?? ""} />
  ) : (
    <SchoolDashboard orgId={orgId} />
  );
}

function SchoolDashboard({ orgId }: { orgId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "school", orgId],
    queryFn: () => dashboardService.school(orgId),
  });

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Pilotage global de votre établissement en temps réel."
        actions={
          <Button asChild>
            <Link to="/students">Gérer les élèves</Link>
          </Button>
        }
      />
      {isLoading || !data ? (
        <LoadingStats />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Élèves actifs"
              value={data.students}
              icon={Users}
              hint={`${data.instructors} moniteurs`}
            />
            <StatCard
              label="Séances aujourd'hui"
              value={data.todaySessions}
              icon={CalendarDays}
              tone="accent"
            />
            <StatCard
              label="Taux de réussite"
              value={`${data.successRate}%`}
              icon={TrendingUp}
              tone="success"
            />
            <StatCard
              label="Impayés"
              value={money(data.outstanding)}
              icon={Wallet}
              tone="destructive"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Examens à venir" value={data.upcomingExams} icon={GraduationCap} />
            <StatCard
              label="Copies à corriger"
              value={data.toGrade}
              icon={ClipboardList}
              tone="accent"
            />
            <StatCard
              label="Élèves en difficulté"
              value={data.strugglingStudents}
              icon={AlertTriangle}
              tone="destructive"
            />
            <StatCard label="Cours publiés" value={data.progressChart.length * 2} icon={BookOpen} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Progression moyenne</CardTitle>
                <CardDescription>Théorie et pratique sur les 6 derniers mois</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.progressChart}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.4}
                    />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="theorie"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={0.18}
                    />
                    <Area
                      type="monotone"
                      dataKey="pratique"
                      stroke="var(--color-accent)"
                      fill="var(--color-accent)"
                      fillOpacity={0.25}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inscriptions</CardTitle>
                <CardDescription>Nouveaux élèves par mois</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.enrollmentChart}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.4}
                    />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="inscriptions" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Derniers résultats d'examens enregistrés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/70 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {dateTime(item.at)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function InstructorDashboard({ orgId, instructorId }: { orgId: string; instructorId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "instructor", orgId, instructorId],
    queryFn: () => dashboardService.instructor(orgId, instructorId),
  });

  return (
    <div>
      <PageHeader
        title="Mon tableau de bord"
        description="Vos élèves, séances et corrections du jour."
      />
      {isLoading || !data ? (
        <LoadingStats />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Mes élèves" value={data.students} icon={Users} />
            <StatCard
              label="Séances aujourd'hui"
              value={data.todaySessions}
              icon={CalendarDays}
              tone="accent"
            />
            <StatCard label="Devoirs créés" value={data.assignments} icon={ClipboardList} />
            <StatCard
              label="À corriger"
              value={data.pendingGrading}
              icon={AlertTriangle}
              tone="destructive"
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Élèves en difficulté</CardTitle>
              <CardDescription>Moyenne inférieure à 60 %</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.struggling.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun élève en difficulté. Excellent travail.
                </p>
              ) : (
                data.struggling.map((s) => (
                  <Link
                    key={s.id}
                    to="/students/$studentId"
                    params={{ studentId: s.id }}
                    className="block rounded-lg border border-border/70 px-4 py-3 transition-colors hover:bg-accent/20"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        {s.firstName} {s.lastName}
                      </p>
                      <span className="text-sm font-semibold text-destructive">{s.average}%</span>
                    </div>
                    <Progress value={s.average} className="mt-2 h-1.5" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
