import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { groupsService } from "@/services/groups";
import { instructorsService } from "@/services/instructors";
import { useOrg } from "@/lib/org";
import { date } from "@/lib/format";

export const Route = createFileRoute("/_shell/groups")({
  head: () => ({
    meta: [
      { title: "Groupes de formation — DriveHub" },
      {
        name: "description",
        content:
          "Organisez vos promotions : groupes par catégorie de permis, moniteur référent et progression collective.",
      },
      { property: "og:title", content: "Groupes de formation — DriveHub" },
      {
        property: "og:description",
        content: "Promotions, effectifs et progression moyenne par groupe.",
      },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  const { orgId } = useOrg();
  const groups = useQuery({
    queryKey: ["groups", orgId],
    queryFn: () => groupsService.list(orgId),
  });
  const instructors = useQuery({
    queryKey: ["instructors", orgId, ""],
    queryFn: () => instructorsService.list(orgId),
  });

  const nameOf = (id: string) => {
    const i = instructors.data?.find((x) => x.id === id);
    return i ? `${i.firstName} ${i.lastName}` : "—";
  };

  return (
    <div>
      <PageHeader title="Groupes" description="Promotions et suivi collectif des élèves." />
      {groups.isLoading ? (
        <LoadingGrid />
      ) : !groups.data || groups.data.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun groupe"
          description="Créez un groupe pour organiser vos promotions."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.data.map((g) => (
            <Card key={g.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{g.name}</CardTitle>
                <Badge variant="secondary">{g.category}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Moniteur : {nameOf(g.instructorId)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {date(g.startDate)} → {date(g.endDate)}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Users className="size-4 text-muted-foreground" /> {g.studentIds.length} élèves
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>Progression moyenne</span>
                    <span>{g.averageProgress}%</span>
                  </div>
                  <Progress value={g.averageProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
