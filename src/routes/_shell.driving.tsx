import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Route as RouteIcon, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { drivingService, vehiclesService } from "@/services/misc";
import { studentsService } from "@/services/students";
import { instructorsService } from "@/services/instructors";
import { useOrg } from "@/lib/org";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/_shell/driving")({
  head: () => ({
    meta: [
      { title: "Séances de conduite — DriveHub" },
      {
        name: "description",
        content:
          "Planification des heures de conduite : élèves, moniteurs, véhicules et détection automatique des conflits d'horaires.",
      },
      { property: "og:title", content: "Séances de conduite — DriveHub" },
      {
        property: "og:description",
        content: "Suivi et création des séances pratiques de l'auto-école.",
      },
    ],
  }),
  component: DrivingPage,
});

function DrivingPage() {
  const { orgId, role, studentId, instructorId } = useOrg();
  const qc = useQueryClient();
  const canManage =
    role === "admin" || role === "secretary" || role === "instructor" || role === "superadmin";
  const filters =
    role === "student" && studentId
      ? { studentId }
      : role === "instructor" && instructorId
        ? { instructorId }
        : {};

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["driving", orgId, role, studentId, instructorId],
    queryFn: () => drivingService.list(orgId, filters),
  });
  const { data: students } = useQuery({
    queryKey: ["students-all", orgId],
    queryFn: () => studentsService.list(orgId, { pageSize: 500 }),
  });
  const { data: instructors } = useQuery({
    queryKey: ["instructors", orgId],
    queryFn: () => instructorsService.list(orgId),
  });
  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", orgId],
    queryFn: () => vehiclesService.list(orgId),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    instructorId: "",
    vehicleId: "",
    start: "",
    durationMin: "60",
    notes: "",
  });

  const startIso = form.start ? new Date(form.start).toISOString() : "";
  const endIso = form.start
    ? new Date(new Date(form.start).getTime() + Number(form.durationMin) * 60000).toISOString()
    : "";
  const conflicts =
    startIso && form.instructorId && form.vehicleId && form.studentId
      ? drivingService.conflicts(orgId, {
          start: startIso,
          end: endIso,
          instructorId: form.instructorId,
          vehicleId: form.vehicleId,
          studentId: form.studentId,
        })
      : [];

  const create = useMutation({
    mutationFn: () =>
      drivingService.create(orgId, {
        studentId: form.studentId,
        instructorId: form.instructorId,
        vehicleId: form.vehicleId,
        start: startIso,
        end: endIso,
        status: "planned",
        notes: form.notes || undefined,
        skillsReviewed: [],
      }),
    onSuccess: () => {
      toast.success("Séance planifiée");
      setOpen(false);
      setForm({
        studentId: "",
        instructorId: "",
        vehicleId: "",
        start: "",
        durationMin: "60",
        notes: "",
      });
      void qc.invalidateQueries({ queryKey: ["driving"] });
      void qc.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  const rows = sessions ?? [];
  const done = rows.filter((s) => s.status === "done").length;
  const hours = Math.round(
    rows.reduce(
      (sum, s) => sum + (new Date(s.end).getTime() - new Date(s.start).getTime()) / 3600000,
      0,
    ),
  );

  const nameOf = (id: string) => {
    const s = students?.items.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : "—";
  };
  const instructorName = (id: string) => {
    const i = instructors?.find((x) => x.id === id);
    return i ? `${i.firstName} ${i.lastName}` : "—";
  };
  const vehicleName = (id: string) => {
    const v = vehicles?.find((x) => x.id === id);
    return v ? `${v.brand} ${v.model}` : "—";
  };

  return (
    <div>
      <PageHeader
        title="Conduite"
        description="Séances pratiques, moniteurs et véhicules affectés."
        actions={
          canManage ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 size-4" />
                  Planifier une séance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle séance de conduite</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Élève</Label>
                    <Select
                      value={form.studentId}
                      onValueChange={(v) => setForm({ ...form, studentId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.items.slice(0, 60).map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.firstName} {s.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Moniteur</Label>
                    <Select
                      value={form.instructorId}
                      onValueChange={(v) => setForm({ ...form, instructorId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors?.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.firstName} {i.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Véhicule</Label>
                    <Select
                      value={form.vehicleId}
                      onValueChange={(v) => setForm({ ...form, vehicleId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.brand} {v.model} • {v.plate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="start">Date et heure</Label>
                      <Input
                        id="start"
                        type="datetime-local"
                        value={form.start}
                        onChange={(e) => setForm({ ...form, start: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Durée</Label>
                      <Select
                        value={form.durationMin}
                        onValueChange={(v) => setForm({ ...form, durationMin: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                  {conflicts.length > 0 ? (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <span>
                        {conflicts.length} conflit(s) détecté(s) sur ce créneau (moniteur, véhicule
                        ou élève déjà occupé).
                      </span>
                    </div>
                  ) : null}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    disabled={
                      !form.studentId ||
                      !form.instructorId ||
                      !form.vehicleId ||
                      !form.start ||
                      conflicts.length > 0 ||
                      create.isPending
                    }
                    onClick={() => create.mutate()}
                  >
                    Planifier
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Séances" value={rows.length} icon={RouteIcon} />
        <StatCard label="Réalisées" value={done} icon={RouteIcon} tone="success" />
        <StatCard
          label="Planifiées"
          value={rows.filter((s) => s.status === "planned").length}
          icon={RouteIcon}
          tone="accent"
        />
        <StatCard label="Heures cumulées" value={`${hours} h`} icon={RouteIcon} />
      </div>
      {isLoading ? (
        <LoadingGrid />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={RouteIcon}
          title="Aucune séance"
          description="Planifiez une première séance de conduite."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Créneau</TableHead>
                    <TableHead>Élève</TableHead>
                    <TableHead>Moniteur</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 60).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap">{dateTime(s.start)}</TableCell>
                      <TableCell>{nameOf(s.studentId)}</TableCell>
                      <TableCell>{instructorName(s.instructorId)}</TableCell>
                      <TableCell>{vehicleName(s.vehicleId)}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            s.status === "planned"
                              ? "published"
                              : s.status === "done"
                                ? "done"
                                : "expired"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
