import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { organizationsService } from "@/services/misc";
import { useOrg } from "@/lib/org";
import { ROLE_LABELS } from "@/lib/session";
import { date, money } from "@/lib/format";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres — DriveHub" },
      {
        name: "description",
        content:
          "Configurez l'établissement, la facturation, les notifications et les préférences de votre auto-école.",
      },
      { property: "og:title", content: "Paramètres — DriveHub" },
      {
        property: "og:description",
        content: "Profil de l'établissement, licence et préférences de notification.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { orgId, session, role } = useOrg();
  const { data: org } = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => organizationsService.get(orgId),
  });
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [prefs, setPrefs] = useState({ email: true, sms: false, reminders: true, digest: true });

  const orgName = name || org?.name || "";
  const orgCity = city || org?.city || "";

  return (
    <div>
      <PageHeader title="Paramètres" description="Établissement, licence et préférences." />
      <Tabs defaultValue="school">
        <TabsList>
          <TabsTrigger value="school">Établissement</TabsTrigger>
          <TabsTrigger value="account">Mon compte</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="license">Licence</TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil de l'auto-école</CardTitle>
              <CardDescription>
                Informations affichées aux élèves et sur les documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="org-name">Nom</Label>
                <Input id="org-name" value={orgName} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-city">Ville</Label>
                <Input id="org-city" value={orgCity} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-slug">Identifiant</Label>
                <Input id="org-slug" value={org?.slug ?? ""} readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-color">Couleur principale</Label>
                <Input id="org-color" value={org?.primaryColor ?? ""} readOnly />
              </div>
              <div className="sm:col-span-2">
                <Button
                  onClick={() => toast.success("Paramètres enregistrés")}
                  disabled={role !== "admin" && role !== "superadmin"}
                >
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mon compte</CardTitle>
              <CardDescription>Vos informations personnelles.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="first">Prénom</Label>
                <Input id="first" defaultValue={session.user.firstName} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last">Nom</Label>
                <Input id="last" defaultValue={session.user.lastName} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={session.user.email} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" defaultValue={session.user.phone} />
              </div>
              <div className="grid gap-2">
                <Label>Rôle</Label>
                <Input value={ROLE_LABELS[session.user.role]} readOnly />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={() => toast.success("Profil mis à jour")}>Mettre à jour</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>Choisissez les alertes que vous souhaitez recevoir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {(
                [
                  ["email", "Notifications par email", "Devoirs, examens et messages importants."],
                  ["sms", "Notifications par SMS", "Rappels de séances de conduite."],
                  ["reminders", "Rappels de séance", "24 h avant chaque séance planifiée."],
                  ["digest", "Résumé hebdomadaire", "Synthèse de l'activité chaque lundi."],
                ] as const
              ).map(([key, label, description], i) => (
                <div key={key}>
                  {i > 0 ? <Separator /> : null}
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Switch
                      checked={prefs[key]}
                      onCheckedChange={(v) => {
                        setPrefs({ ...prefs, [key]: v });
                        toast.success("Préférence enregistrée");
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="license" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Licence et facturation</CardTitle>
              <CardDescription>Formule active de l'établissement.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Formule</p>
                <p className="mt-1 font-display text-xl font-bold capitalize">
                  {org?.licensePlan ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Statut</p>
                <div className="mt-1">{org ? <StatusBadge status={org.status} /> : "—"}</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Expiration</p>
                <p className="mt-1 font-medium">{org ? date(org.licenseExpiresAt) : "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Revenu mensuel
                </p>
                <p className="mt-1 font-medium">{org ? money(org.monthlyRevenue) : "—"}</p>
              </div>
              <div className="sm:col-span-3">
                <Button
                  variant="outline"
                  onClick={() => toast.info("Contactez le support pour changer de formule")}
                >
                  Changer de formule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
