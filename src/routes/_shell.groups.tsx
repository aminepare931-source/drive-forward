import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { groupsService } from "@/services/groups";
import { instructorsService } from "@/services/instructors";
import { useOrg } from "@/lib/org";
import { date } from "@/lib/format";
import type { LicenseCategory } from "@/types";

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

const CATEGORIES: LicenseCategory[] = ["A", "A1", "B", "BE", "C", "D"];

function GroupsPage() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<LicenseCategory>("B");
  const [instructorId, setInstructorId] = useState("");

  const groups = useQuery({
    queryKey: ["groups", orgId],
    queryFn: () => groupsService.list(orgId),
  });
  const instructors = useQuery({
    queryKey: ["instructors", orgId, ""],
    queryFn: () => instructorsService.list(orgId),
    enabled: open || true,
  });

  const create = useMutation({
    mutationFn: (input: {
      name: string;
      category: LicenseCategory;
      instructorId: string;
      startDate: string;
      endDate: string;
    }) => groupsService.create(orgId, input),
    onSuccess: () => {
      toast.success("Groupe créé");
      setOpen(false);
      setCategory("B");
      setInstructorId("");
      qc.invalidateQueries({ queryKey: ["groups", orgId] });
    },
  });

  const nameOf = (id: string) => {
    const i = instructors.data?.find((x) => x.id === id);
    return i ? `${i.firstName} ${i.lastName}` : "—";
  };

  const form = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-1 size-4" /> Nouveau groupe
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border/70 px-6 py-5 pl-8 sm:px-8">
          <SheetTitle className="font-display text-xl">Créer un groupe</SheetTitle>
          <SheetDescription>Une promotion d'élèves suivie par un moniteur référent.</SheetDescription>
        </SheetHeader>

        <form
          id="new-group"
          className="flex-1 space-y-4 overflow-y-auto px-6 py-6 pl-8 sm:px-8"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (!instructorId) {
              toast.error("Sélectionnez un moniteur référent.");
              return;
            }
            create.mutate({
              name: String(fd.get("name")),
              category,
              instructorId,
              startDate: new Date(String(fd.get("startDate"))).toISOString(),
              endDate: new Date(String(fd.get("endDate"))).toISOString(),
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="g-name">Nom du groupe</Label>
            <Input id="g-name" name="name" placeholder="Ex. Promo B — Janvier" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="g-cat">Catégorie</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as LicenseCategory)}>
                <SelectTrigger id="g-cat">
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
            <div className="space-y-2">
              <Label htmlFor="g-instructor">Moniteur référent</Label>
              <Combobox
                id="g-instructor"
                allowCustom={false}
                options={(instructors.data ?? []).map((i) => ({
                  value: i.id,
                  label: `${i.firstName} ${i.lastName}`,
                }))}
                value={instructorId}
                onChange={setInstructorId}
                placeholder="Sélectionner"
                searchPlaceholder="Rechercher un moniteur…"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="g-start">Date de début</Label>
              <Input id="g-start" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="g-end">Date de fin prévue</Label>
              <Input id="g-end" name="endDate" type="date" required />
            </div>
          </div>
        </form>

        <SheetFooter className="border-t border-border/70 px-6 py-4 pl-8 sm:px-8">
          <Button variant="outline" type="button" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" form="new-group" disabled={create.isPending}>
            Créer le groupe
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  return (
    <div>
      <PageHeader title="Groupes" description="Promotions et suivi collectif des élèves." actions={form} />
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
