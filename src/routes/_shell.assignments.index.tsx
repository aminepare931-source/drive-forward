import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignmentsService } from "@/services/assignments";
import { useOrg } from "@/lib/org";
import { dateTime } from "@/lib/format";

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
  const { orgId, role, studentId } = useOrg();
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["assignments", orgId, status, role, studentId],
    queryFn: () =>
      assignmentsService.list(orgId, role === "student" && studentId ? { studentId } : { status }),
  });

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
