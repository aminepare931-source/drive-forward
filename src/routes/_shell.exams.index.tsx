import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { examsService } from "@/services/exams";
import { useOrg } from "@/lib/org";
import { dateTime } from "@/lib/format";

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
  const { data, isLoading } = useQuery({
    queryKey: ["exams", orgId],
    queryFn: () => examsService.list(orgId),
  });

  return (
    <div>
      <PageHeader title="Examens" description="Sessions théoriques et pratiques." />
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
