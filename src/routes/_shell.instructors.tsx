import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Star, UserCog } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { instructorsService } from "@/services/instructors";
import { useOrg } from "@/lib/org";
import { date, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LicenseCategory } from "@/types";

export const Route = createFileRoute("/_shell/instructors")({
  head: () => ({
    meta: [
      { title: "Moniteurs — DriveHub" },
      {
        name: "description",
        content:
          "Gérez l'équipe pédagogique : spécialités, charge d'élèves, disponibilité et évaluations des moniteurs.",
      },
      { property: "og:title", content: "Moniteurs — DriveHub" },
      {
        property: "og:description",
        content: "Équipe pédagogique, disponibilités et charge de travail.",
      },
    ],
  }),
  component: InstructorsPage,
});

const ALL_CATEGORIES: LicenseCategory[] = ["A", "A1", "B", "BE", "C", "D"];

function InstructorsPage() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [specialties, setSpecialties] = useState<LicenseCategory[]>(["B"]);
  const [availability, setAvailability] = useState<"available" | "busy" | "off">("available");

  const { data, isLoading } = useQuery({
    queryKey: ["instructors", orgId, search],
    queryFn: () => instructorsService.list(orgId, search),
  });

  const create = useMutation({
    mutationFn: (input: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      specialties: LicenseCategory[];
      availability: "available" | "busy" | "off";
    }) => instructorsService.create(orgId, input),
    onSuccess: () => {
      toast.success("Moniteur ajouté");
      setOpen(false);
      setSpecialties(["B"]);
      setAvailability("available");
      qc.invalidateQueries({ queryKey: ["instructors", orgId] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Moniteurs"
        description="Équipe pédagogique et répartition des élèves."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 size-4" /> Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau moniteur</DialogTitle>
              </DialogHeader>
              <form
                id="new-instructor"
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  if (specialties.length === 0) {
                    toast.error("Sélectionnez au moins une spécialité.");
                    return;
                  }
                  create.mutate({
                    firstName: String(fd.get("firstName")),
                    lastName: String(fd.get("lastName")),
                    email: String(fd.get("email")),
                    phone: String(fd.get("phone")),
                    specialties,
                    availability,
                  });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="i-first">Prénom</Label>
                  <Input id="i-first" name="firstName" autoComplete="given-name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="i-last">Nom</Label>
                  <Input id="i-last" name="lastName" autoComplete="family-name" required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="i-mail">E-mail</Label>
                  <Input id="i-mail" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="i-phone">Téléphone</Label>
                  <Input id="i-phone" name="phone" type="tel" autoComplete="tel" required />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Spécialités (catégories enseignées)</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CATEGORIES.map((c) => {
                      const active = specialties.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            setSpecialties((prev) =>
                              active ? prev.filter((v) => v !== c) : [...prev, c],
                            )
                          }
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-input bg-background text-muted-foreground hover:border-primary/40",
                          )}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="i-avail">Disponibilité</Label>
                  <Select
                    value={availability}
                    onValueChange={(v) => setAvailability(v as typeof availability)}
                  >
                    <SelectTrigger id="i-avail">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="busy">Occupé</SelectItem>
                      <SelectItem value="off">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
              <DialogFooter>
                <Button type="submit" form="new-instructor" disabled={create.isPending}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un moniteur…"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <LoadingGrid />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Aucun moniteur"
          description="Ajoutez votre premier moniteur pour commencer."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials(i.firstName, i.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {i.firstName} {i.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{i.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={i.availability} />
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {i.specialties.map((c) => (
                    <Badge key={c} variant="secondary">
                      {c}
                    </Badge>
                  ))}
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-muted/60 py-2">
                    <dt className="text-muted-foreground">Élèves</dt>
                    <dd className="font-display text-base font-bold">{i.studentCount}</dd>
                  </div>
                  <div className="rounded-lg bg-muted/60 py-2">
                    <dt className="text-muted-foreground">Séances</dt>
                    <dd className="font-display text-base font-bold">{i.sessionsThisWeek}</dd>
                  </div>
                  <div className="rounded-lg bg-muted/60 py-2">
                    <dt className="text-muted-foreground">Note</dt>
                    <dd className="flex items-center justify-center gap-1 font-display text-base font-bold">
                      <Star className="size-3 fill-warning text-warning" />
                      {i.rating}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">Depuis le {date(i.hiredAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
