import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calendarService } from "@/services/misc";
import { useOrg } from "@/lib/org";
import { time, date as fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_shell/planning")({
  head: () => ({
    meta: [
      { title: "Planning hebdomadaire — DriveHub" },
      {
        name: "description",
        content:
          "Calendrier des séances de conduite, cours théoriques et examens de votre auto-école, semaine par semaine.",
      },
      { property: "og:title", content: "Planning hebdomadaire — DriveHub" },
      {
        property: "og:description",
        content: "Visualisez et filtrez toutes les activités planifiées de l'auto-école.",
      },
    ],
  }),
  component: PlanningPage,
});

const TYPE_STYLES: Record<string, string> = {
  driving: "bg-primary/10 text-primary border-primary/25",
  course: "bg-accent/20 text-accent-foreground border-accent/40",
  exam: "bg-destructive/10 text-destructive border-destructive/30",
  meeting: "bg-muted text-muted-foreground border-border",
};
const TYPE_LABELS: Record<string, string> = {
  driving: "Conduite",
  course: "Cours",
  exam: "Examen",
  meeting: "Réunion",
};
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function startOfWeek(offset: number) {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function PlanningPage() {
  const { orgId, role, studentId, instructorId } = useOrg();
  const [offset, setOffset] = useState(0);
  const [type, setType] = useState("all");

  const filters =
    role === "student" && studentId
      ? { studentId }
      : role === "instructor" && instructorId
        ? { instructorId }
        : {};
  const { data, isLoading } = useQuery({
    queryKey: ["calendar", orgId, role, studentId, instructorId],
    queryFn: () => calendarService.list(orgId, filters),
  });

  const week = useMemo(() => {
    const start = startOfWeek(offset);
    return DAYS.map((label, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const events = (data ?? [])
        .filter((e) => type === "all" || e.type === type)
        .filter((e) => {
          const t = new Date(e.start).getTime();
          return t >= day.getTime() && t < next.getTime();
        });
      return { label, day, events };
    });
  }, [data, offset, type]);

  const total = week.reduce((s, d) => s + d.events.length, 0);

  return (
    <div>
      <PageHeader
        title="Planning"
        description="Séances de conduite, cours et examens de la semaine."
        actions={
          <div className="flex items-center gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="driving">Conduite</SelectItem>
                <SelectItem value="course">Cours</SelectItem>
                <SelectItem value="exam">Examen</SelectItem>
                <SelectItem value="meeting">Réunion</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOffset((o) => o - 1)}
              aria-label="Semaine précédente"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" onClick={() => setOffset(0)}>
              Cette semaine
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOffset((o) => o + 1)}
              aria-label="Semaine suivante"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />
      {isLoading ? (
        <LoadingGrid />
      ) : total === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Aucun événement cette semaine"
          description="Changez de semaine ou de filtre pour voir d'autres activités."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {week.map(({ label, day, events }) => (
            <Card key={label} className="border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-baseline justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {fmtDate(day.toISOString())}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {events.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Rien de prévu</p>
                ) : (
                  events.map((e) => (
                    <div key={e.id} className="rounded-lg border border-border/70 bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{e.title}</span>
                        <Badge variant="outline" className={TYPE_STYLES[e.type]}>
                          {TYPE_LABELS[e.type]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {time(e.start)} – {time(e.end)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
