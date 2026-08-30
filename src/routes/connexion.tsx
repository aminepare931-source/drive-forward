import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Building2, GraduationCap, UserCog } from "lucide-react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthSubmit, type SubmitStatus } from "@/components/auth/AuthSubmit";
import { useSession } from "@/lib/session";
import { fadeUp, stagger } from "@/lib/motion";

const DEMO_ACCOUNTS = [
  { email: "demo.directeur@drivehub.test", label: "Directeur", icon: Building2 },
  { email: "demo.moniteur@drivehub.test", label: "Moniteur", icon: UserCog },
  { email: "demo.eleve@drivehub.test", label: "Élève", icon: GraduationCap },
] as const;

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "DriveHub — Connexion à votre auto-école" },
      {
        name: "description",
        content:
          "Connectez-vous à DriveHub pour piloter élèves, moniteurs, planning, examens et paiements de votre auto-école.",
      },
      { property: "og:title", content: "DriveHub — Connexion à votre auto-école" },
      {
        property: "og:description",
        content: "Plateforme tout-en-un de gestion et de formation pour auto-écoles.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { session, ready, login } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) {
      navigate({
        to: session.user.role === "student" ? "/mon-espace" : "/dashboard",
        replace: true,
      });
    }
  }, [ready, session, navigate]);

  const go = (role: string) =>
    navigate({ to: role === "student" ? "/mon-espace" : "/dashboard", replace: true });

  const quickLogin = (demoEmail: string) => {
    const next = login(demoEmail);
    if (!next) {
      toast.error("Compte démo introuvable.");
      return;
    }
    toast.success(`Connecté en tant que ${next.user.firstName} 🚗`);
    go(next.user.role);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setError(null);
    setStatus("loading");

    // Petite latence simulée pour le retour visuel.
    await new Promise((r) => setTimeout(r, 650));

    const next = login(email);
    if (!next) {
      setStatus("idle");
      setError("Nous n'avons pas trouvé de compte avec cette adresse e-mail.");
      return;
    }

    setStatus("success");
    toast.success(`Bon retour ${next.user.firstName} 🚗`);
    setTimeout(() => go(next.user.role), 600);
  };

  return (
    <AuthShell>
      <motion.div variants={stagger(0.1, 0.07)} initial="hidden" animate="show">
        <motion.div variants={fadeUp}>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            <Link to="/" className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline">
              ← Accueil
            </Link>
          </p>
          <h1 className="font-display text-[1.9rem] font-bold tracking-tight">
            Bon retour parmi nous
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Identification rapide, espace adapté à votre rôle.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-7">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Connexion rapide (démo)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => quickLogin(acc.email)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-3 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <acc.icon className="size-4 text-primary" />
                <span className="text-xs font-medium">{acc.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou avec un compte
            <span className="h-px flex-1 bg-border" />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <AuthField
              label="Adresse e-mail"
              type="email"
              autoComplete="email"
              placeholder="prenom.nom@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <AuthField
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between pt-1 text-sm">
              <label className="flex cursor-pointer select-none items-center gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 accent-[var(--primary)]"
                />
                Se souvenir de moi
              </label>
              <button
                type="button"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

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
              Se connecter <ArrowRight className="size-4" />
            </AuthSubmit>
          </form>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-7 flex items-center gap-3 text-xs text-muted-foreground"
        >
          <span className="h-px flex-1 bg-border" />
          « Votre espace auto-école » est sécurisé.
          <span className="h-px flex-1 bg-border" />
        </motion.div>

        <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            to="/inscription"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Inscrivez-vous en 2 minutes
          </Link>
        </motion.p>
      </motion.div>
    </AuthShell>
  );
}