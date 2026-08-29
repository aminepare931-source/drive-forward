import { Link, createFileRoute } from "@tanstack/react-router";
import { motion, useScroll } from "framer-motion";
import { useEffect, useState, type ComponentProps } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  TrafficCone,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DriveHub — La plateforme des auto-écoles modernes" },
      {
        name: "description",
        content:
          "Gérez élèves, moniteurs, planning, examens et paiements de votre auto-école depuis une seule plateforme. Pour les établissements comme pour les élèves.",
      },
      { property: "og:title", content: "DriveHub — La plateforme des auto-écoles" },
      { property: "og:description", content: "Tout votre établissement, une seule plateforme." },
    ],
  }),
  component: LandingPage,
});

const FADE: ComponentProps<typeof motion.div> = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: EASE },
};

function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          onDark
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        <TrafficCone className="size-5" />
      </span>
      <span
        className={cn(
          "font-display text-lg font-semibold tracking-tight",
          onDark ? "text-sidebar-foreground" : "text-foreground",
        )}
      >
        DriveHub
      </span>
    </span>
  );
}

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Pour qui", href: "#pour-qui" },
  { label: "Comment ça marche", href: "#etapes" },
];

function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 12)), [scrollY]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur transition-colors",
        scrolled ? "border-border bg-background/85" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="Accueil DriveHub">
          <Brand />
        </Link>
        <nav className="hidden items-center gap-8 text-[0.925rem] font-normal text-muted-foreground md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/connexion" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Se connecter
          </Link>
          <Link
            to="/inscription"
            className={cn(buttonVariants({ size: "sm" }), "rounded-full px-4")}
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

const HERO_STATS = [
  { value: "18", label: "modules de gestion" },
  { value: "3", label: "rôles : école, moniteur, élève" },
  { value: "1", label: "espace pour tout piloter" },
];

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-32 top-0 size-[28rem] rounded-full bg-indigo-400/30 blur-[100px]"
          animate={{ opacity: [0.16, 0.24, 0.16], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 top-24 size-[26rem] rounded-full bg-amber-400/25 blur-[100px]"
          animate={{ opacity: [0.12, 0.2, 0.12], x: [0, -60, 0], y: [0, 40, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/3 top-64 size-72 rounded-full bg-fuchsia-400/15 blur-[100px]"
          animate={{ opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 pb-20 pt-20 text-center sm:px-8 lg:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" /> Plateforme tout-en-un pour auto-écoles
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-[2.75rem] font-light leading-[1.05] tracking-[-0.02em] sm:text-6xl lg:text-[4.25rem]">
            Toute votre auto-école,
            <br />
            <span className="font-medium text-indigo-600">une seule plateforme.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            Élèves, moniteurs, planning, examens, paiements, documents. Pilotez la formation et
            l'administration de votre établissement au même endroit — et suivez votre progression
            si vous êtes élève.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/inscription"
              className={cn(buttonVariants({ size: "lg" }), "rounded-full px-6")}
            >
              Créer mon compte <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/connexion"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-6")}
            >
              Se connecter
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="mx-auto mt-14 flex max-w-lg items-center justify-center divide-x divide-border"
        >
          {HERO_STATS.map((s) => (
            <div key={s.label} className="flex-1 px-4 first:pl-0 last:pr-0">
              <p className="font-display text-2xl font-medium text-foreground sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
        className="relative mx-auto max-w-5xl px-5 pb-24 sm:px-8"
      >
        <Card className="overflow-hidden rounded-3xl border-border/60 shadow-2xl shadow-indigo-500/10">
          <CardContent className="grid gap-px bg-border/60 p-0 sm:grid-cols-3">
            <div className="space-y-4 bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-medium">Tableau de bord</span>
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  École active
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Users, v: "124", l: "Élèves" },
                  { icon: UserCog, v: "8", l: "Moniteurs" },
                  { icon: Car, v: "12", l: "Véhicules" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-border/70 bg-muted/40 p-3">
                    <s.icon className="size-4 text-indigo-600" />
                    <p className="mt-2 font-display text-lg font-medium">{s.v}</p>
                    <p className="text-xs text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 bg-card p-6 sm:col-span-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progression du groupe permis B</span>
                <span className="font-medium text-foreground">72%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-indigo-500"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "72%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" /> 86% théorie validée
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" /> 58% conduite validée
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Conforme à la réglementation du permis de conduire" },
  { icon: Lock, label: "Données hébergées et chiffrées" },
  { icon: Users, label: "Pensé pour élèves, moniteurs et directions" },
  { icon: CheckCircle2, label: "Suivi théorique et pratique jusqu'à l'examen" },
];

function TrustBar() {
  return (
    <section className="border-y border-border/70 bg-muted/20 py-10">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {TRUST_ITEMS.map((t) => (
            <div key={t.label} className="flex items-center gap-2.5 text-muted-foreground">
              <t.icon className="size-4 shrink-0 text-indigo-500" />
              <span className="text-xs leading-snug sm:text-sm">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <motion.div {...FADE} className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{kicker}</span>
      <h2 className="mt-3 font-display text-3xl font-light tracking-[-0.01em] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 font-light text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  roles: string;
}

const FEATURES: Feature[] = [
  { icon: LayoutDashboard, title: "Pilotage", desc: "Tableau de bord et suivi d'activité pour diriger votre établissement.", roles: "Direction" },
  { icon: Users, title: "Élèves", desc: "Fiches de suivi, progression et historique complet par apprenant.", roles: "Tous les rôles" },
  { icon: UserCog, title: "Moniteurs", desc: "Équipe, spécialités, planning et charge de travail des moniteurs.", roles: "Direction & secrétariat" },
  { icon: BookOpen, title: "Cours & théorie", desc: "Contenus de formation, groupes et suivi de la progression théorique.", roles: "Direction & moniteurs" },
  { icon: ClipboardList, title: "Devoirs", desc: "Exercices, banque de questions et remises corrigées.", roles: "Direction, moniteurs & élèves" },
  { icon: GraduationCap, title: "Examens", desc: "Examens blancs et suivi des résultats jusqu'au passage du permis.", roles: "Direction, moniteurs & élèves" },
  { icon: CalendarDays, title: "Planning", desc: "Séances, créneaux et réservation des véhicules en un coup d'œil.", roles: "Tous les rôles" },
  { icon: Car, title: "Véhicules", desc: "Parc, entretien, révisions et disponibilité de chaque voiture.", roles: "Direction & secrétariat" },
  { icon: CreditCard, title: "Paiements", desc: "Suivi des règlements, échéances et historique par élève.", roles: "Direction, secrétariat & élèves" },
  { icon: FileText, title: "Documents", desc: "Contrats, certificats et pièces administratives centralisés.", roles: "Direction, secrétariat & élèves" },
  { icon: MessageSquare, title: "Messagerie", desc: "Tous les échanges entre l'école, les moniteurs et les élèves.", roles: "Tous les rôles" },
  { icon: ShieldCheck, title: "Multi-écoles", desc: "Pilotez plusieurs établissements depuis un même espace sécurisé.", roles: "Groupes d'écoles" },
];

function Features() {
  return (
    <section id="fonctionnalites" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          kicker="Fonctionnalités"
          title="Tout ce qu'une auto-école attend, réuni"
          sub="18 modules couvrant la formation, les opérations et l'administration — accessibles selon votre rôle."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE }}
            >
              <Card className="h-full rounded-2xl border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 text-indigo-600">
                      <f.icon className="size-5" />
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {f.roles}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-medium">{f.title}</h3>
                  <p className="mt-1.5 text-sm font-light leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Audience() {
  const cards = [
    {
      icon: Building2,
      title: "Pour les auto-écoles",
      items: [
        "Gérez élèves, moniteurs et véhicules",
        "Planifiez séances, cours et examens",
        "Suivez paiements et documents",
        "Pilotez plusieurs établissements",
      ],
      cta: { to: "/inscription", label: "Ouvrir mon auto-école" },
      dark: true,
    },
    {
      icon: GraduationCap,
      title: "Pour les élèves",
      items: [
        "Suivez votre progression théorique et pratique",
        "Réalisez vos devoirs et examens blancs",
        "Consultez votre planning et vos paiements",
        "Échangez avec votre moniteur",
      ],
      cta: { to: "/inscription", label: "Créer mon espace élève" },
      dark: false,
    },
  ] as const;

  return (
    <section id="pour-qui" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          kicker="Pour qui"
          title="Une plateforme pour chacun"
          sub="Que vous dirigiez une école ou que vous passiez votre permis, DriveHub s'adapte à votre rôle."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: EASE }}
            >
              <Card
                className={cn(
                  "h-full overflow-hidden rounded-3xl border-0",
                  c.dark
                    ? "bg-sidebar text-sidebar-foreground"
                    : "border border-border/60 bg-card",
                )}
              >
                <CardContent className="p-8">
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl",
                      c.dark ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-primary/10 text-primary",
                    )}
                  >
                    <c.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-medium">{c.title}</h3>
                  <ul className="mt-5 space-y-3">
                    {c.items.map((it) => (
                      <li
                        key={it}
                        className={cn(
                          "flex items-start gap-2.5 text-sm font-light",
                          c.dark ? "text-sidebar-foreground/75" : "text-muted-foreground",
                        )}
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-success" /> {it}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={c.cta.to}
                    className={cn(
                      buttonVariants({ variant: c.dark ? "secondary" : "outline" }),
                      "mt-7 rounded-full",
                    )}
                  >
                    {c.cta.label} <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", t: "Créez votre compte", d: "Choisissez votre profil — élève ou directeur d'auto-école — et renseignez vos informations." },
  { n: "02", t: "Configurez votre espace", d: "Les directeurs créent leur établissement ; les élèves rejoignent leur auto-école." },
  { n: "03", t: "Pilotez au quotidien", d: "Suivez la formation, le planning, les paiements et les documents en temps réel." },
];

function Steps() {
  return (
    <section id="etapes" className="scroll-mt-20 bg-muted/25 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          kicker="Comment ça marche"
          title="Lancez-vous en quelques minutes"
          sub="Une prise en main simple, quel que soit votre profil."
        />
        <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: EASE }}
              className="relative"
            >
              <span className="font-display text-6xl font-light text-primary/15">{s.n}</span>
              <h3 className="mt-2 font-display text-lg font-medium">{s.t}</h3>
              <p className="mt-1.5 text-sm font-light leading-relaxed text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div
          {...FADE}
          className="relative overflow-hidden rounded-[2.5rem] bg-sidebar px-6 py-16 text-center text-sidebar-foreground sm:px-12 sm:py-20"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -left-16 -top-16 size-72 rounded-full bg-indigo-500/30 blur-[90px]" />
            <div className="absolute -right-10 bottom-0 size-72 rounded-full bg-amber-400/20 blur-[90px]" />
          </div>
          <div className="relative">
            <h2 className="font-display text-3xl font-light tracking-[-0.01em] sm:text-4xl">
              Prêt à piloter votre auto-école
              <br />
              avec <span className="font-medium text-sidebar-primary">DriveHub</span> ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm font-light text-sidebar-foreground/70 sm:text-base">
              Créez votre compte en quelques minutes. Les directeurs ouvrent leur établissement,
              les élèves rejoignent leur école.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/inscription"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full bg-sidebar-primary px-6 text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                )}
              >
                Créer mon compte <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/connexion"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-6")}
              >
                J'ai déjà un compte
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
        <Brand />
        <p className="text-center text-xs font-light text-muted-foreground">
          © {new Date().getFullYear()} DriveHub — Plateforme de gestion pour auto-écoles.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/connexion" className="hover:text-foreground">Connexion</Link>
          <Link to="/inscription" className="hover:text-foreground">Inscription</Link>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <TrustBar />
      <Features />
      <Audience />
      <Steps />
      <CtaBand />
      <Footer />
    </div>
  );
}
