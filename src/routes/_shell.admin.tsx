import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid, LoadingStats } from "@/components/common/Loading";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { organizationsService } from "@/services/misc";
import { useOrg } from "@/lib/org";
import { useSession } from "@/lib/session";
import { date, money } from "@/lib/format";

export const Route = createFileRoute("/_shell/admin")({
  head: () => ({
    meta: [
      { title: "Console plateforme — DriveHub" },
      {
        name: "description",
        content:
          "Console super-administrateur : établissements, licences, statuts, utilisateurs et revenus de la plateforme DriveHub.",
      },
      { property: "og:title", content: "Console plateforme — DriveHub" },
      {
        property: "og:description",
        content: "Pilotez les auto-écoles, les licences et les revenus de la plateforme.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { role } = useOrg();
  const { switchOrganization } = useSession();
  const qc = useQueryClient();
  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => organizationsService.platformStats(),
  });
  const { data: orgs, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => organizationsService.list(),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "trial" | "suspended" }) =>
      organizationsService.update(id, { status }),
    onSuccess: () => {
      toast.success("Établissement mis à jour");
      void qc.invalidateQueries({ queryKey: ["organizations"] });
      void qc.invalidateQueries({ queryKey: ["platform-stats"] });
    },
  });

  if (role !== "superadmin") {
    return (
      <div>
        <PageHeader title="Console plateforme" />
        <EmptyState
          icon={ShieldCheck}
          title="Accès réservé"
          description="Seul le super administrateur peut accéder à la console plateforme."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Console plateforme"
        description="Établissements, licences et santé de la plateforme."
      />

      {!stats ? (
        <LoadingStats />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Établissements"
            value={stats.totalSchools}
            hint={`${stats.activeSchools} actifs · ${stats.trialSchools} en essai`}
            icon={Building2}
          />
          <StatCard
            label="Utilisateurs"
            value={stats.totalUsers}
            hint={`${stats.totalStudents} élèves`}
            icon={Users}
            tone="accent"
          />
          <StatCard
            label="Revenu mensuel"
            value={money(stats.revenue)}
            hint={`+${stats.growth}% ce mois`}
            icon={TrendingUp}
            tone="success"
          />
          <StatCard
            label="Licences à renouveler"
            value={stats.expiringSoon}
            hint="dans moins de 45 jours"
            icon={ShieldCheck}
            tone={stats.expiringSoon ? "destructive" : "default"}
          />
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <LoadingGrid />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Établissement</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Formule</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Licence</TableHead>
                    <TableHead>Revenu</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orgs ?? []).map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.name}</TableCell>
                      <TableCell>{o.city}</TableCell>
                      <TableCell className="capitalize">{o.licensePlan}</TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell>{date(o.licenseExpiresAt)}</TableCell>
                      <TableCell>{money(o.monthlyRevenue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Select
                            value={o.status}
                            onValueChange={(v) =>
                              update.mutate({
                                id: o.id,
                                status: v as "active" | "trial" | "suspended",
                              })
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Actif</SelectItem>
                              <SelectItem value="trial">Essai</SelectItem>
                              <SelectItem value="suspended">Suspendu</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              switchOrganization(o.id);
                              toast.success(`Vous consultez ${o.name}`);
                            }}
                          >
                            Ouvrir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
