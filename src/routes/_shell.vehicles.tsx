import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Car, Plus, Wrench } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vehiclesService } from "@/services/misc";
import { useOrg } from "@/lib/org";
import { date, money } from "@/lib/format";
import type { LicenseCategory } from "@/types";

export const Route = createFileRoute("/_shell/vehicles")({
  head: () => ({
    meta: [
      { title: "Parc de véhicules — DriveHub" },
      {
        name: "description",
        content:
          "Gestion de la flotte : kilométrage, disponibilité, échéances d'assurance et de contrôle technique, historique d'entretien.",
      },
      { property: "og:title", content: "Parc de véhicules — DriveHub" },
      {
        property: "og:description",
        content: "Suivez l'état et les échéances de chaque véhicule de l'auto-école.",
      },
    ],
  }),
  component: VehiclesPage,
});

const CATEGORIES: LicenseCategory[] = ["A", "A1", "B", "BE", "C", "D"];

function VehiclesPage() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["vehicles", orgId],
    queryFn: () => vehiclesService.list(orgId),
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    brand: "",
    model: "",
    plate: "",
    category: "B" as LicenseCategory,
    mileage: "0",
  });

  const create = useMutation({
    mutationFn: () =>
      vehiclesService.create(orgId, {
        brand: form.brand,
        model: form.model,
        plate: form.plate.toUpperCase(),
        category: form.category,
        mileage: Number(form.mileage) || 0,
        status: "available",
        insuranceExpiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
        inspectionExpiresAt: new Date(Date.now() + 300 * 86400000).toISOString(),
      }),
    onSuccess: () => {
      toast.success("Véhicule ajouté");
      setOpen(false);
      setForm({ brand: "", model: "", plate: "", category: "B", mileage: "0" });
      void qc.invalidateQueries({ queryKey: ["vehicles", orgId] });
    },
  });

  const rows = data ?? [];
  const soon = rows.filter(
    (v) => new Date(v.insuranceExpiresAt).getTime() - Date.now() < 60 * 86400000,
  ).length;

  return (
    <div>
      <PageHeader
        title="Véhicules"
        description="Flotte, disponibilité et échéances administratives."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                Ajouter un véhicule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau véhicule</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="brand">Marque</Label>
                  <Input
                    id="brand"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Modèle</Label>
                  <Input
                    id="model"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plate">Plaque</Label>
                  <Input
                    id="plate"
                    value={form.plate}
                    onChange={(e) => setForm({ ...form, plate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v as LicenseCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="km">Kilométrage</Label>
                  <Input
                    id="km"
                    type="number"
                    value={form.mileage}
                    onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button
                  disabled={!form.brand || !form.model || !form.plate || create.isPending}
                  onClick={() => create.mutate()}
                >
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Véhicules" value={rows.length} icon={Car} />
        <StatCard
          label="Disponibles"
          value={rows.filter((v) => v.status === "available").length}
          icon={Car}
          tone="success"
        />
        <StatCard
          label="En maintenance"
          value={rows.filter((v) => v.status === "maintenance").length}
          icon={Wrench}
          tone="accent"
        />
        <StatCard
          label="Assurances à renouveler"
          value={soon}
          icon={Car}
          tone="destructive"
          hint="dans moins de 60 jours"
        />
      </div>
      {isLoading ? (
        <LoadingGrid />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Aucun véhicule"
          description="Ajoutez un premier véhicule à votre flotte."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((v) => (
            <Card key={v.id} className="border-border/70">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">
                    {v.brand} {v.model}
                  </CardTitle>
                  <StatusBadge status={v.status} />
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {v.plate} • Catégorie {v.category}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Kilométrage</p>
                    <p className="font-medium text-foreground">
                      {v.mileage.toLocaleString("fr-FR")} km
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assurance</p>
                    <p className="font-medium text-foreground">{date(v.insuranceExpiresAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contrôle technique</p>
                    <p className="font-medium text-foreground">{date(v.inspectionExpiresAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Entretiens</p>
                    <p className="font-medium text-foreground">{v.maintenance.length}</p>
                  </div>
                </div>
                {v.maintenance.length > 0 ? (
                  <ul className="space-y-1 border-t border-border/60 pt-3 text-xs">
                    {v.maintenance.slice(0, 3).map((m, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span className="truncate text-muted-foreground">
                          {date(m.date)} — {m.label}
                        </span>
                        <span className="font-medium text-foreground">{money(m.cost)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
