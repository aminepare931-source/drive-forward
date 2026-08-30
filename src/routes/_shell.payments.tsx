import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CreditCard, Wallet, AlertCircle } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { paymentsService } from "@/services/misc";
import { studentsService } from "@/services/students";
import { useOrg } from "@/lib/org";
import { date, money } from "@/lib/format";

export const Route = createFileRoute("/_shell/payments")({
  head: () => ({
    meta: [
      { title: "Paiements et facturation — DriveHub" },
      {
        name: "description",
        content:
          "Suivi des règlements des élèves : soldes, encaissements, retards et historique des transactions de l'auto-école.",
      },
      { property: "og:title", content: "Paiements et facturation — DriveHub" },
      {
        property: "og:description",
        content: "Encaissez et suivez les paiements de vos élèves en un coup d'œil.",
      },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { orgId, role, studentId } = useOrg();
  const qc = useQueryClient();
  const isStudent = role === "student";
  const { data, isLoading } = useQuery({
    queryKey: ["payments", orgId, isStudent ? studentId : "all"],
    queryFn: () => paymentsService.list(orgId, isStudent && studentId ? { studentId } : {}),
  });
  const { data: students } = useQuery({
    queryKey: ["students-all", orgId],
    queryFn: () => studentsService.list(orgId, { pageSize: 500 }),
  });

  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<string | null>(null);
  const [amount, setAmount] = useState("100");
  const [method, setMethod] = useState<"card" | "cash" | "transfer" | "mobile_money">("cash");

  const rows = useMemo(
    () => (data ?? []).filter((p) => status === "all" || p.status === status),
    [data, status],
  );
  const totals = useMemo(() => {
    const all = data ?? [];
    return {
      collected: all.reduce((s, p) => s + p.paid, 0),
      outstanding: all.reduce((s, p) => s + (p.total - p.paid), 0),
      late: all.filter((p) => p.status === "late").length,
    };
  }, [data]);

  const pay = useMutation({
    mutationFn: () => paymentsService.pay(orgId, target!, Number(amount) || 0, method),
    onSuccess: () => {
      toast.success("Paiement enregistré");
      setTarget(null);
      void qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const nameOf = (id: string) => {
    const s = students?.items.find((x) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  return (
    <div>
      <PageHeader
        title="Paiements"
        description={
          isStudent ? "Votre échéancier et vos règlements." : "Encaissements, soldes et relances."
        }
        actions={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
              <SelectItem value="partial">Partiel</SelectItem>
              <SelectItem value="late">En retard</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Encaissé" value={money(totals.collected)} icon={Wallet} tone="success" />
        <StatCard
          label="Reste à percevoir"
          value={money(totals.outstanding)}
          icon={CreditCard}
          tone="accent"
        />
        <StatCard
          label="Dossiers en retard"
          value={totals.late}
          icon={AlertCircle}
          tone="destructive"
        />
      </div>
      {isLoading ? (
        <LoadingGrid />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Aucun paiement"
          description="Les règlements apparaîtront ici."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {!isStudent ? <TableHead>Élève</TableHead> : null}
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead className="w-48">Avancement</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      {!isStudent ? (
                        <TableCell className="font-medium">{nameOf(p.studentId)}</TableCell>
                      ) : null}
                      <TableCell className="whitespace-nowrap">{date(p.date)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {money(p.paid)} / {money(p.total)}
                      </TableCell>
                      <TableCell>
                        <Progress value={Math.round((p.paid / p.total) * 100)} className="h-2" />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {p.paid < p.total ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTarget(p.id);
                              setAmount(String(p.total - p.paid));
                            }}
                          >
                            Encaisser
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Montant</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="method">Mode de paiement</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="transfer">Virement</SelectItem>
                  <SelectItem value="card">Carte bancaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Annuler
            </Button>
            <Button disabled={pay.isPending} onClick={() => pay.mutate()}>
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
