import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
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
import { documentsService } from "@/services/misc";
import { useOrg } from "@/lib/org";
import { date } from "@/lib/format";

export const Route = createFileRoute("/_shell/documents")({
  head: () => ({
    meta: [
      { title: "Documents — DriveHub" },
      {
        name: "description",
        content:
          "Contrats, pièces d'identité, certificats médicaux et factures : centralisez et suivez les échéances des documents de l'auto-école.",
      },
      { property: "og:title", content: "Documents — DriveHub" },
      {
        property: "og:description",
        content: "Bibliothèque documentaire de l'auto-école avec suivi des échéances.",
      },
    ],
  }),
  component: DocumentsPage,
});

const CATEGORIES = [
  { value: "contract", label: "Contrat" },
  { value: "identity", label: "Identité" },
  { value: "medical", label: "Médical" },
  { value: "certificate", label: "Attestation" },
  { value: "invoice", label: "Facture" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

function DocumentsPage() {
  const { orgId, role, studentId } = useOrg();
  const qc = useQueryClient();
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; category: Category }>({
    name: "",
    category: "contract",
  });

  const filters = role === "student" && studentId ? { studentId, category } : { category };
  const { data, isLoading } = useQuery({
    queryKey: ["documents", orgId, category, role === "student" ? studentId : null],
    queryFn: () => documentsService.list(orgId, filters),
  });

  const upload = useMutation({
    mutationFn: () =>
      documentsService.upload(orgId, {
        name: form.name || "Document.pdf",
        category: form.category,
      }),
    onSuccess: () => {
      toast.success("Document ajouté");
      setOpen(false);
      setForm({ name: "", category: "contract" });
      void qc.invalidateQueries({ queryKey: ["documents", orgId] });
    },
  });

  const rows = data ?? [];
  const expiring = rows.filter(
    (d) => d.expiresAt && new Date(d.expiresAt).getTime() - Date.now() < 60 * 86400000,
  );

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Bibliothèque documentaire et suivi des échéances."
        actions={
          role !== "student" ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 size-4" />
                  Téléverser
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau document</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="doc-name">Nom du fichier</Label>
                    <Input
                      id="doc-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="contrat-formation.pdf"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v as Category })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={() => upload.mutate()} disabled={upload.isPending}>
                    Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{rows.length} document(s)</span>
          {expiring.length > 0 ? (
            <Badge
              variant="outline"
              className="border-warning/40 bg-warning/20 text-warning-foreground"
            >
              {expiring.length} échéance(s) proche(s)
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingGrid />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun document"
          description="Téléversez un premier document pour alimenter la bibliothèque."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Ajouté le</TableHead>
                  <TableHead>Expire</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground" />
                        {d.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {CATEGORIES.find((c) => c.value === d.category)?.label ?? d.category}
                    </TableCell>
                    <TableCell>{d.sizeKb} Ko</TableCell>
                    <TableCell>{date(d.uploadedAt)}</TableCell>
                    <TableCell>{d.expiresAt ? date(d.expiresAt) : "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info("Téléchargement simulé")}
                      >
                        <Download className="mr-2 size-4" />
                        Télécharger
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
