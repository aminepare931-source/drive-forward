import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Building2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthSubmit, type SubmitStatus } from "@/components/auth/AuthSubmit";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { CITIES } from "@/lib/cities";
import { useSession } from "@/lib/session";
import { authService, type RegisterKind } from "@/services/auth";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { LicenseCategory } from "@/types";

export const Route = createFileRoute("/inscription")({
  head: () => ({
    meta: [
      { title: "DriveHub — Créer un compte" },
      {
        name: "description",
        content:
          "Inscrivez-vous en quelques minutes pour rejoindre votre auto-école et suivre votre progression.",
      },
    ],
  }),
  component: RegisterPage,
});

const CATEGORIES: { value: LicenseCategory; label: string; hint: string }[] = [
  { value: "A1", label: "A1", hint: "125 cm³" },
  { value: "B", label: "B", hint: "Permis auto" },
  { value: "BE", label: "BE", hint: "Voiture + rem." },
  { value: "C", label: "C", hint: "Poids lourd" },
];

function RegisterPage() {
  const { session, ready, login } = useSession();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [category, setCategory] = useState<LicenseCategory>("B");
  const [kind, setKind] = useState<RegisterKind>("student");
  const [schoolName, setSchoolName] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accept, setAccept] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) navigate({ to: "/", replace: true });
  }, [ready, session, navigate]);

  const go = (role: string) =>
    navigate({ to: role === "student" ? "/mon-espace" : "/dashboard", replace: true });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setError(null);

    if (kind === "director" && !city.trim()) {
      setError("Veuillez sélectionner la ville de votre établissement.");
      return;
    }
    if (!accept) {
      setError("Veuillez accepter les conditions générales pour créer votre compte.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setStatus("loading");
    // Latence simulée pour le retour visuel.
    await new Promise((r) => setTimeout(r, 750));

    try {
      await authService.register(
        kind === "director"
          ? { kind, firstName, lastName, email, phone, schoolName, city }
          : { kind, firstName, lastName, email, phone, birthDate, category },
      );
      const next = login(email);
      if (!next) throw new Error("Impossible de finaliser l'inscription.");

      setStatus("success");
      toast.success(
        kind === "director"
          ? `Votre établissement est prêt, ${next.user.firstName} 🏫`
          : `Bienvenue dans votre espace, ${next.user.firstName} 🎉`,
      );
      setTimeout(() => go(next.user.role), 650);
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue pendant l'inscription.",
      );
    }
  };

  return (
    <AuthShell>
      <motion.div variants={stagger(0.06, 0.06)} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-[1.9rem] font-bold tracking-tight">Créer un compte</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choisissez votre profil pour démarrer sur DriveHub.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-6 grid grid-cols-2 gap-3">
          {(
            [
              { value: "student", label: "Je suis élève", desc: "Suivre ma formation", icon: GraduationCap },
              { value: "director", label: "J'ouvre une auto-école", desc: "Créer mon établissement", icon: Building2 },
            ] as const
          ).map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setKind(opt.value)}
              aria-pressed={kind === opt.value}
              className={cn(
                "flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all",
                kind === opt.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/40",
              )}
            >
              <opt.icon
                className={cn("size-5", kind === opt.value ? "text-primary" : "text-muted-foreground")}
              />
              <span className="text-sm font-semibold leading-tight">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <AuthField
                label="Prénom"
                autoComplete="given-name"
                placeholder="Marie"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <AuthField
                label="Nom"
                autoComplete="family-name"
                placeholder="Durand"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <AuthField
              label="Adresse e-mail"
              type="email"
              autoComplete="email"
              placeholder="marie.durand@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <AuthField
              label="Téléphone"
              type="tel"
              autoComplete="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            {kind === "student" ? (
              <div className="grid grid-cols-2 gap-3">
                <AuthField
                  label="Date de naissance"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
                <div>
                  <span className="text-sm font-medium leading-none">Catégorie visée</span>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(c.value)}
                        aria-pressed={category === c.value}
                        className={cn(
                          "flex flex-col items-center rounded-lg border px-1 py-2 text-sm font-semibold transition-all",
                          category === c.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        {c.label}
                        <span className="text-[10px] font-normal text-muted-foreground">{c.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <AuthField
                  label="Nom de l'auto-école"
                  placeholder="Ex. Auto-École du Centre"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  required
                />
                <div className="space-y-1.5">
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
              </>
            )}

            <AuthField
              label="Mot de passe"
              type="password"
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="Choisissez un mot de passe d'au moins 8 caractères."
              minLength={8}
              required
            />
            <AuthField
              label="Confirmez le mot de passe"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
            />

            <label className="flex cursor-pointer select-none items-start gap-2.5 pt-1 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={accept}
                onChange={(e) => setAccept(e.target.checked)}
                className="mt-0.5 size-4 accent-[var(--primary)]"
              />
              <span>
                J'accepte les{" "}
                <span className="text-foreground underline underline-offset-2">
                  conditions d'utilisation
                </span>{" "}
                et la{" "}
                <span className="text-foreground underline underline-offset-2">
                  politique de confidentialité
                </span>.
              </span>
            </label>

            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {error}
              </motion.div>
            ) : null}

            <AuthSubmit status={status}>
              {kind === "director" ? "Créer mon établissement" : "Créer mon compte"}{" "}
              <ArrowRight className="size-4" />
            </AuthSubmit>
          </form>
        </motion.div>

        <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link
            to="/connexion"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Retour à la connexion
          </Link>
        </motion.p>
      </motion.div>
    </AuthShell>
  );
}