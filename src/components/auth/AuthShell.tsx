import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { TrafficCone, CheckCircle2, Star } from "lucide-react";
import { EASE, fadeIn, fadeUp, stagger } from "@/lib/motion";

const HIGHLIGHTS = [
  "Un espace par rôle : élève, moniteur ou établissement",
  "Suivi de progression théorie et conduite, en temps réel",
  "Devoirs, examens blancs et banque de questions officielles",
];

function DecorativeOrbs({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-28 -top-24 size-[26rem] rounded-full bg-indigo-400 blur-3xl"
        initial={{ opacity: 0, x: -40, y: -20 }}
        animate={
          reduced ? { opacity: 0.16 } : { opacity: 0.18, x: [0, 60, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-16 size-[28rem] rounded-full bg-amber-400/80 blur-3xl"
        initial={{ opacity: 0, x: 40, y: 30 }}
        animate={
          reduced
            ? { opacity: 0.14 }
            : { opacity: 0.17, x: [0, -70, 0], y: [0, -40, 0], scale: [1.1, 1, 1.1] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-2/3 size-64 rounded-full bg-indigo-500/70 blur-3xl"
        initial={{ opacity: 0 }}
        animate={reduced ? { opacity: 0.06 } : { opacity: 0.1, y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* fine dotted grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(1 0 0 / 1) 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />
    </div>
  );
}

function Brand({ dark }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <motion.span
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className={
          dark
            ? "flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
            : "flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
        }
      >
        <TrafficCone className="size-5" />
      </motion.span>
      <span
        className={`font-display text-lg font-bold tracking-tight ${
          dark ? "text-sidebar-foreground" : "text-foreground"
        }`}
      >
        DriveHub
      </span>
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <main className="relative min-h-screen bg-background lg:grid lg:grid-cols-[1.06fr_1fr]">
      {/* Panneau visuel — masqué sur mobile */}
      <section className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <DecorativeOrbs reduced={!!reduced} />

        <div className="relative">
          <Brand dark />
        </div>

        <div className="relative max-w-md">
          <motion.span
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-sidebar-primary"
          >
            Auto-école nouvelle génération
          </motion.span>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-3 font-display text-[2.6rem] font-bold leading-[1.08] tracking-tight"
          >
            Tout votre établissement,
            <br />
            <span className="text-sidebar-primary">une seule plateforme.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 text-sm leading-relaxed text-sidebar-foreground/70"
          >
            De l'inscription au permis, suivez chaque élève, chaque séance et
            chaque paiement depuis un espace simple et clair.
          </motion.p>
          <motion.ul
            variants={stagger(0.35, 0.09)}
            initial="hidden"
            animate="show"
            className="mt-9 space-y-3"
          >
            {HIGHLIGHTS.map((item) => (
              <motion.li
                key={item}
                variants={fadeUp}
                className="flex items-start gap-3 text-sm text-sidebar-foreground/80"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sidebar-primary" />
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={
              reduced
                ? { opacity: 1, y: 0 }
                : {
                    opacity: 1,
                    y: [0, -6, 0],
                    transition: { y: { delay: 2, duration: 6, repeat: Infinity, ease: "easeInOut" } },
                  }
            }
            transition={{ opacity: { duration: 0.6, ease: EASE } }}
            className="flex items-center gap-4 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-4 backdrop-blur"
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <div className="text-xs leading-tight text-sidebar-foreground/80">
              <p className="font-semibold text-sidebar-foreground">4,8 / 5</p>
              <p>2 400+ apprenants accompagnés jusqu'au permis</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Panneau formulaire — contenu fourni par la route */}
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}