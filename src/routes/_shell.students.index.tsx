import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GraduationCap, MapPin, Plus, Search, User, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CITIES } from "@/lib/cities";
import { studentsService } from "@/services/students";
import { instructorsService } from "@/services/instructors";
import { groupsService } from "@/services/groups";
import { useOrg } from "@/lib/org";
import { initials } from "@/lib/format";
import type { LicenseCategory } from "@/types";

export const Route = createFileRoute("/_shell/students/")({
  head: () => ({
    meta: [
      { title: "Élèves — DriveHub" },
      {
        name: "description",
        content:
          "Recherchez, filtrez et suivez la progression de tous les élèves inscrits dans votre auto-école.",
      },
      { property: "og:title", content: "Élèves — DriveHub" },
      {
        property: "og:description",
        content: "Liste complète des élèves avec statut, catégorie et progression.",
      },
    ],
  }),
  component: StudentsPage,
});

const CATEGORIES: LicenseCategory[] = ["A", "A1", "B", "BE", "C", "D"];

function StudentsPage() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<LicenseCategory>("B");
  const [city, setCity] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [enrolledAt, setEnrolledAt] = useState(() => new Date().toISOString().slice(0, 10));

  const { data, isLoading } = useQuery({
    queryKey: ["students", orgId, search, status, page],
    queryFn: () => studentsService.list(orgId, { search, status, page, pageSize: 10 }),
  });
  const { data: instructors } = useQuery({
    queryKey: ["instructors", orgId],
    queryFn: () => instructorsService.list(orgId),
    enabled: open,
  });
  const { data: groups } = useQuery({
    queryKey: ["groups", orgId],
    queryFn: () => groupsService.list(orgId),
    enabled: open,
  });

  const resetForm = () => {
    setCategory("B");
    setCity("");
    setInstructorId("");
    setGroupId("");
    setEnrolledAt(new Date().toISOString().slice(0, 10));
  };

  const create = useMutation({
    mutationFn: (input: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      category: LicenseCategory;
      birthDate: string;
      address: string;
      enrolledAt: string;
      instructorId?: string;
      groupId?: string;
    }) =>
      studentsService.create(orgId, {
        ...input,
        status: "active",
      }),
    onSuccess: () => {
      toast.success("Élève inscrit");
      setOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["students", orgId] });
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div>
      <PageHeader
        title="Élèves"
        description="Dossiers, progression et suivi pédagogique."
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-1 size-4" /> Nouvel élève
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col p-0 sm:max-w-2xl">
              <SheetHeader className="border-b border-border/70 px-6 py-5 pl-8 sm:px-8">
                <SheetTitle className="font-display text-xl">Inscrire un élève</SheetTitle>
                <SheetDescription>
                  Dossier complet : coordonnées, formation visée et affectation.
                </SheetDescription>
              </SheetHeader>

              <form
                id="new-student"
                className="flex-1 overflow-y-auto px-6 py-6 pl-8 sm:px-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  if (!city.trim()) {
                    toast.error("Renseignez la ville de l'élève.");
                    return;
                  }
                  const street = String(fd.get("street") ?? "").trim();
                  create.mutate({
                    firstName: String(fd.get("firstName")),
                    lastName: String(fd.get("lastName")),
                    email: String(fd.get("email")),
                    phone: String(fd.get("phone")),
                    birthDate: String(fd.get("birthDate")),
                    category,
                    address: street ? `${street}, ${city}` : city,
                    enrolledAt: new Date(enrolledAt).toISOString(),
                    ...(instructorId ? { instructorId } : {}),
                    ...(groupId ? { groupId } : {}),
                  });
                }}
              >
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="size-4 text-primary" /> Informations personnelles
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" name="firstName" autoComplete="given-name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" name="lastName" autoComplete="family-name" required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="birthDate">Date de naissance</Label>
                      <Input id="birthDate" name="birthDate" type="date" required />
                    </div>
                  </div>
                </section>

                <Separator className="my-6" />

                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MapPin className="size-4 text-primary" /> Coordonnées
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" name="email" type="email" autoComplete="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Combobox
                        id="city"
                        options={CITIES}
                        value={city}
                        onChange={setCity}
                        placeholder="Sélectionner une ville"
                        searchPlaceholder="Rechercher une ville…"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="street">Adresse</Label>
                      <Input id="street" name="street" placeholder="Quartier, secteur, rue…" />
                    </div>
                  </div>
                </section>

                <Separator className="my-6" />

                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <GraduationCap className="size-4 text-primary" /> Formation
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie visée</Label>
                      <Select value={category} onValueChange={(v) => setCategory(v as LicenseCategory)}>
                        <SelectTrigger id="category">
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
                      <Label htmlFor="enrolledAt">Date d'inscription</Label>
                      <Input
                        id="enrolledAt"
                        type="date"
                        value={enrolledAt}
                        onChange={(e) => setEnrolledAt(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Moniteur assigné</Label>
                      <Combobox
                        id="instructor"
                        allowCustom={false}
                        options={(instructors ?? []).map((i) => ({
                          value: i.id,
                          label: `${i.firstName} ${i.lastName}`,
                        }))}
                        value={instructorId}
                        onChange={setInstructorId}
                        placeholder="Aucun pour l'instant"
                        searchPlaceholder="Rechercher un moniteur…"
                        emptyLabel="Aucun moniteur trouvé."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group">Groupe</Label>
                      <Combobox
                        id="group"
                        allowCustom={false}
                        options={(groups ?? []).map((g) => ({ value: g.id, label: g.name }))}
                        value={groupId}
                        onChange={setGroupId}
                        placeholder="Aucun pour l'instant"
                        searchPlaceholder="Rechercher un groupe…"
                        emptyLabel="Aucun groupe trouvé."
                      />
                    </div>
                  </div>
                </section>
              </form>

              <SheetFooter className="border-t border-border/70 px-6 py-4 pl-8 sm:px-8">
                <Button variant="outline" onClick={() => setOpen(false)} type="button">
                  Annuler
                </Button>
                <Button type="submit" form="new-student" disabled={create.isPending}>
                  Enregistrer
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher un élève…"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="paused">En pause</SelectItem>
              <SelectItem value="graduated">Diplômé</SelectItem>
              <SelectItem value="archived">Archivé</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingGrid />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun élève trouvé"
          description="Ajustez vos filtres ou inscrivez un nouvel élève."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                    <TableHead className="hidden lg:table-cell">Progression</TableHead>
                    <TableHead className="hidden sm:table-cell">Moyenne</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((s) => (
                    <TableRow key={s.id} className="cursor-pointer">
                      <TableCell>
                        <Link
                          to="/students/$studentId"
                          params={{ studentId: s.id }}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="size-9">
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">
                              {initials(s.firstName, s.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {s.firstName} {s.lastName}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {s.email}
                            </span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{s.category}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Progress
                          value={Math.round((s.theoryProgress + s.practiceProgress) / 2)}
                          className="h-1.5 w-32"
                        />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm font-semibold">
                        {s.average}%
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {data && data.total > data.pageSize ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data.total} élèves • page {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
