import { Link, createFileRoute } from "@tanstack/react-router";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  HeadphonesIcon,
  LayoutDashboard,
  MessageSquare,
  Phone,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrafficCone,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

/* ---------- Motion helpers ---------- */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function MotionButton({
  to,
  href,
  children,
  className,
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const inner = (
    <motion.span
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn("inline-flex items-center", className)}
    >
      {children}
    </motion.span>
  );
  if (to) {
    return (
      <Link to={to} className="inline-block">
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className="inline-block">
      {inner}
    </a>
  );
}

/* ---------- Shared bits ---------- */

function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <motion.span
        whileHover={{ rotate: -8, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          onDark ? "bg-white text-primary" : "bg-primary text-primary-foreground",
        )}
      >
        <TrafficCone className="size-5" />
      </motion.span>
      <span
        className={cn(
          "font-display text-lg font-semibold tracking-tight",
          onDark ? "text-white" : "text-foreground",
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
  { label: "Questions", href: "#faq" },
];

function Header() {
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 12)), [scrollY]);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={cn(
        "sticky top-0 z-40 bg-sidebar text-sidebar-foreground transition-shadow",
        scrolled && "shadow-lg shadow-black/10",
      )}
    >
      <motion.div
        style={{ scaleX: progress }}
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-primary"
      />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="Accueil DriveHub">
          <Brand onDark />
        </Link>
        <nav
          onMouseLeave={() => setHovered(null)}
          className="hidden items-center gap-1 text-sm text-sidebar-foreground/70 md:flex"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onMouseEnter={() => setHovered(l.href)}
              className="relative px-3 py-2 transition-colors hover:text-sidebar-foreground"
            >
              {hovered === l.href && (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 rounded-full bg-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{l.label}</span>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a
            href="tel:+33100000000"
            className="hidden items-center gap-2 text-sm text-sidebar-foreground/80 lg:flex"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-sidebar-foreground/10">
              <Phone className="size-3.5" />
            </span>
            01 00 00 00 00
          </a>
          <MotionButton to="/inscription" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-4")}>
            Essai gratuit
          </MotionButton>
        </div>
      </div>
    </motion.header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-primary/30 via-transparent to-transparent" />
        <motion.div
          className="absolute -right-20 top-10 size-96 rounded-full bg-primary/40 blur-[110px]"
          animate={{ opacity: [0.5, 0.75, 0.5], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-sidebar-foreground/85"
          >
            <Sparkles className="size-3.5" /> Plateforme tout-en-un
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-4xl font-bold uppercase leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
          >
            Conduite sereine,
            <br />
            réussite <span className="text-primary">assurée.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-md text-base leading-relaxed text-sidebar-foreground/70"
          >
            DriveHub réunit élèves, moniteurs, planning, examens et paiements dans un seul
            espace. Une gestion simple pour l'école, un suivi clair pour l'élève.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <MotionButton to="/inscription" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-6")}>
              Créer mon compte <ArrowRight className="size-4" />
            </MotionButton>
            <MotionButton
              to="/connexion"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full border-white/25 bg-transparent px-6 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground",
              )}
            >
              Se connecter
            </MotionButton>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="relative mx-auto aspect-square w-full max-w-sm"
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/90 to-primary/50 shadow-2xl shadow-primary/30"
          >
            <div className="flex size-full items-center justify-center">
              <motion.div
                animate={{ rotate: [0, -4, 0, 4, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <Car className="size-32 text-white/90" strokeWidth={1.2} />
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
            whileHover={{ y: -4 }}
            className="absolute -bottom-6 -left-6 w-56 rounded-2xl bg-card p-4 text-foreground shadow-xl"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold leading-none">
                  <AnimatedCounter value={700} suffix="+" />
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">élèves accompagnés</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
            whileHover={{ y: 4 }}
            className="absolute -right-4 -top-4 flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-foreground shadow-xl"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <CheckCircle2 className="size-4 text-success" />
            </motion.span>
            <span className="text-xs font-medium">Suivi en temps réel</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionKicker({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
      <span className="h-px w-6 bg-primary" /> {label}
    </span>
  );
}

function TrustSection() {
  const points = [
    { icon: HeadphonesIcon, text: "Support disponible 24/7 pour élèves et moniteurs" },
    { icon: Clock, text: "Planning flexible, modifiable en quelques clics" },
    { icon: CheckCircle2, text: "Suivi de progression en temps réel jusqu'au permis" },
  ];
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative mx-auto aspect-square w-full max-w-xs"
        >
          <motion.div
            animate={{ rotate: [0, 3, 0, -3, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-muted to-muted/40"
          />
          <div className="absolute inset-6 flex items-center justify-center rounded-[2rem] bg-primary/10">
            <UserCog className="size-24 text-primary" strokeWidth={1.1} />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
            className="absolute -bottom-4 -right-4 flex size-16 items-center justify-center rounded-full bg-card text-center shadow-lg"
          >
            <span className="font-display text-xs font-bold leading-tight text-primary">
              Depuis
              <br />
              2020
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={fadeUp}>
            <SectionKicker label="À propos" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            DriveHub, le partenaire de confiance de votre auto-école
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-muted-foreground">
            Que ce soit pour la formation, l'administration ou la relation avec vos élèves, notre
            équipe conçoit DriveHub pour rendre la gestion d'une auto-école simple et fluide, du
            premier cours jusqu'au passage de l'examen.
          </motion.p>
          <motion.ul variants={staggerContainer} className="mt-6 space-y-3">
            {points.map((p) => (
              <motion.li
                key={p.text}
                variants={fadeUp}
                className="flex items-center gap-3 text-sm font-medium"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <p.icon className="size-4" />
                </span>
                {p.text}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
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

function FeatureCard({ f }: { f: Feature }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
      <Card className="h-full overflow-hidden rounded-2xl border-border/60 shadow-lg transition-shadow hover:shadow-xl">
        <div className="flex h-24 items-center justify-center bg-primary/10">
          <motion.span
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <f.icon className="size-5" />
          </motion.span>
        </div>
        <CardContent className="p-5">
          <h3 className="font-display text-base font-semibold">{f.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Découvrir <ArrowUpRight className="size-3.5" />
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Features() {
  return (
    <section id="fonctionnalites" className="scroll-mt-20">
      <div className="relative overflow-hidden bg-primary pb-28 pt-16 text-primary-foreground sm:pb-32 sm:pt-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08]">
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-16 top-0 size-72 rounded-full bg-white blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, -10, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-10 bottom-0 size-80 rounded-full bg-white blur-3xl"
          />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-5 sm:px-8">
          <motion.div {...({ initial: "hidden", whileInView: "show", viewport: { once: true } } as const)} variants={staggerContainer}>
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70"
            >
              <span className="h-px w-6 bg-primary-foreground/60" /> Fonctionnalités
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-3 max-w-md font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Nos modules de gestion
            </motion.h2>
          </motion.div>
          <div className="flex items-center gap-3 text-primary-foreground/85">
            <span className="flex size-10 items-center justify-center rounded-full bg-white/15">
              <Phone className="size-4" />
            </span>
            <div className="text-sm">
              <p className="text-xs text-primary-foreground/60">Une question ?</p>
              <p className="font-semibold">01 00 00 00 00</p>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-20 w-full text-background sm:h-28"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,64 C240,120 480,0 720,32 C960,64 1200,128 1440,64 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      <div className="relative mx-auto -mt-20 max-w-6xl px-5 sm:-mt-24 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.slice(0, 8).map((f) => (
            <FeatureCard key={f.title} f={f} />
          ))}
        </motion.div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          18 modules couvrant la formation, les opérations et l'administration — accessibles
          selon votre rôle dans l'établissement.
        </p>
      </div>

      <div className="h-20 sm:h-24" />
    </section>
  );
}

const STEPS = [
  { n: "01", icon: UserPlus, t: "Créez votre compte", d: "Choisissez votre profil — élève ou directeur d'auto-école — et renseignez vos informations." },
  { n: "02", icon: Settings2, t: "Configurez votre espace", d: "Les directeurs créent leur établissement ; les élèves rejoignent leur auto-école." },
  { n: "03", icon: LayoutDashboard, t: "Pilotez au quotidien", d: "Suivez la formation, le planning, les paiements et les documents en temps réel." },
];

function Steps() {
  return (
    <section id="etapes" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <SectionKicker label="Comment ça marche" />
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Lancez-vous en quelques minutes
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="relative mt-12 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl shadow-primary/5 sm:mt-14"
        >
          <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {STEPS.map((s) => (
              <motion.div
                key={s.n}
                variants={fadeUp}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.015)" }}
                className="relative p-7 sm:p-8"
              >
                <span className="absolute right-6 top-6 font-display text-3xl font-bold text-primary/10 sm:text-4xl">
                  {s.n}
                </span>
                <motion.span
                  whileHover={{ scale: 1.1, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                >
                  <s.icon className="size-5" />
                </motion.span>
                <h3 className="mt-5 font-display text-lg font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 flex justify-center">
          <MotionButton href="#fonctionnalites" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-6")}>
            Découvrir toutes les fonctionnalités <ArrowRight className="size-4" />
          </MotionButton>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { name: "Léa M.", role: "Élève, permis B", quote: "J'ai suivi toute ma progression et réservé mes créneaux sans jamais appeler l'école." },
  { name: "Karim D.", role: "Directeur d'auto-école", quote: "Le planning et les paiements sont enfin centralisés, on a gagné un temps énorme en administration." },
  { name: "Sophie L.", role: "Monitrice", quote: "Je vois d'un coup d'œil la charge de mes élèves et leur avancement théorique." },
];

function Testimonials() {
  return (
    <section className="bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <SectionKicker label="Témoignages" />
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ce qu'en disent nos utilisateurs
          </h2>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} variants={fadeUp} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
              <Card className="h-full rounded-2xl border-border/60 transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {t.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold leading-none">{t.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "Comment mon auto-école rejoint-elle DriveHub ?", a: "Le directeur crée un compte, configure son établissement (véhicules, moniteurs, offres) puis invite ses élèves et moniteurs à rejoindre l'espace." },
  { q: "Un élève peut-il suivre sa progression en temps réel ?", a: "Oui, chaque élève voit sa progression théorique et pratique, ses prochaines séances et ses résultats d'examens blancs directement depuis son espace." },
  { q: "Les paiements sont-ils gérés dans l'application ?", a: "Le suivi des règlements, échéances et historiques par élève est centralisé. Le mode de paiement dépend de la configuration de votre établissement." },
  { q: "DriveHub gère-t-il plusieurs auto-écoles à la fois ?", a: "Oui, les groupes d'établissements peuvent piloter plusieurs auto-écoles depuis un même espace sécurisé." },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="text-center">
          <SectionKicker label="Questions fréquentes" />
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Vos questions, nos réponses
          </h2>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10"
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <motion.div key={f.q} variants={fadeUp}>
                <AccordionItem value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-display text-base font-medium hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="bg-sidebar py-20 text-sidebar-foreground sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary/70 px-6 py-14 text-center text-primary-foreground sm:px-12 sm:py-16"
      >
        <motion.div
          aria-hidden
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full bg-white blur-3xl"
        />
        <h2 className="relative font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Prêt à piloter votre auto-école avec DriveHub ?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-sm text-primary-foreground/85 sm:text-base">
          Créez votre compte en quelques minutes. Les directeurs ouvrent leur établissement,
          les élèves rejoignent leur école.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <MotionButton
            to="/inscription"
            className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-white px-6 text-primary hover:bg-white/90")}
          >
            Créer mon compte <ArrowRight className="size-4" />
          </MotionButton>
          <MotionButton
            to="/connexion"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white",
            )}
          >
            J'ai déjà un compte
          </MotionButton>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Brand onDark />
          <p className="mt-4 max-w-xs text-sm text-sidebar-foreground/60">
            La plateforme de gestion pour auto-écoles — formation, planning et administration
            réunis au même endroit.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
            Produit
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-sidebar-foreground/70">
            <li><a href="#fonctionnalites" className="hover:text-white">Fonctionnalités</a></li>
            <li><a href="#pour-qui" className="hover:text-white">Pour qui</a></li>
            <li><a href="#etapes" className="hover:text-white">Comment ça marche</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
            Compte
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-sidebar-foreground/70">
            <li><Link to="/connexion" className="hover:text-white">Connexion</Link></li>
            <li><Link to="/inscription" className="hover:text-white">Inscription</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
            Restons en contact
          </p>
          <p className="mt-4 text-sm text-sidebar-foreground/60">
            Recevez nos actualités et nouveautés.
          </p>
          <form className="mt-3 flex items-center gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Votre email"
              className="h-10 flex-1 rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={cn(buttonVariants({ size: "sm" }), "shrink-0 rounded-full px-4")}
            >
              OK
            </motion.button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <p className="text-center text-xs text-sidebar-foreground/40">
          © {new Date().getFullYear()} DriveHub — Plateforme de gestion pour auto-écoles.
        </p>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <TrustSection />
      <Features />
      <Steps />
      <Testimonials />
      <Faq />
      <CtaBand />
      <Footer />
    </div>
  );
}
