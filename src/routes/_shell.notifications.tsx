import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notificationsService } from "@/services/misc";
import { useOrg } from "@/lib/org";
import { dateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — DriveHub" },
      {
        name: "description",
        content:
          "Alertes devoirs, examens, séances, paiements et annonces de l'auto-école, réunies dans un seul flux.",
      },
      { property: "og:title", content: "Notifications — DriveHub" },
      {
        property: "og:description",
        content: "Suivez toutes les alertes de votre auto-école en un flux unique.",
      },
    ],
  }),
  component: NotificationsPage,
});

const TYPE_LABELS: Record<string, string> = {
  assignment: "Devoir",
  exam: "Examen",
  session: "Séance",
  message: "Message",
  payment: "Paiement",
  document: "Document",
  announcement: "Annonce",
};

function NotificationsPage() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const [tab, setTab] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", orgId],
    queryFn: () => notificationsService.list(orgId),
  });

  const markAll = useMutation({
    mutationFn: () => notificationsService.markAllRead(orgId),
    onSuccess: () => {
      toast.success("Toutes les notifications sont lues");
      void qc.invalidateQueries({ queryKey: ["notifications", orgId] });
    },
  });

  const all = data ?? [];
  const rows = tab === "unread" ? all.filter((n) => !n.read) : all;
  const unread = all.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Toutes les alertes de votre établissement."
        actions={
          <Button
            variant="outline"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || unread === 0}
          >
            <CheckCheck className="mr-2 size-4" />
            Tout marquer comme lu
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Toutes ({all.length})</TabsTrigger>
          <TabsTrigger value="unread">Non lues ({unread})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <LoadingGrid />
      ) : rows.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous êtes à jour." />
      ) : (
        <div className="space-y-3">
          {rows.map((n) => (
            <Card key={n.id} className={cn(!n.read && "border-primary/40 bg-primary/5")}>
              <CardContent className="flex items-start gap-4 p-4">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bell className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{n.title}</p>
                    <Badge variant="outline">{TYPE_LABELS[n.type] ?? n.type}</Badge>
                    {!n.read ? (
                      <span className="size-2 rounded-full bg-primary" aria-label="Non lue" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{dateTime(n.at)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
