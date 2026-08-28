import type { Role } from "@/types";
import {
  BookOpen,
  Building2,
  Car,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
  UserCog,
  Bell,
  HelpCircle,
  Route as RouteIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: typeof Users;
  roles: Role[];
  group: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    roles: ["admin", "secretary", "instructor", "superadmin"],
    group: "Pilotage",
  },
  {
    to: "/admin",
    label: "Plateforme",
    icon: ShieldCheck,
    roles: ["superadmin"],
    group: "Pilotage",
  },
  {
    to: "/mon-espace",
    label: "Mon espace",
    icon: GraduationCap,
    roles: ["student"],
    group: "Pilotage",
  },

  {
    to: "/students",
    label: "Élèves",
    icon: Users,
    roles: ["admin", "secretary", "instructor", "superadmin"],
    group: "Formation",
  },
  {
    to: "/instructors",
    label: "Moniteurs",
    icon: UserCog,
    roles: ["admin", "secretary", "superadmin"],
    group: "Formation",
  },
  {
    to: "/groups",
    label: "Groupes",
    icon: Building2,
    roles: ["admin", "secretary", "instructor", "superadmin"],
    group: "Formation",
  },
  {
    to: "/courses",
    label: "Cours",
    icon: BookOpen,
    roles: ["admin", "instructor", "student", "superadmin"],
    group: "Formation",
  },

  {
    to: "/assignments",
    label: "Devoirs",
    icon: ClipboardList,
    roles: ["admin", "instructor", "student", "superadmin"],
    group: "Évaluation",
  },
  {
    to: "/exams",
    label: "Examens",
    icon: GraduationCap,
    roles: ["admin", "instructor", "student", "superadmin"],
    group: "Évaluation",
  },
  {
    to: "/questions",
    label: "Banque de questions",
    icon: HelpCircle,
    roles: ["admin", "instructor", "superadmin"],
    group: "Évaluation",
  },

  {
    to: "/planning",
    label: "Planning",
    icon: CalendarDays,
    roles: ["admin", "secretary", "instructor", "student", "superadmin"],
    group: "Opérations",
  },
  {
    to: "/driving",
    label: "Conduite",
    icon: RouteIcon,
    roles: ["admin", "secretary", "instructor", "student", "superadmin"],
    group: "Opérations",
  },
  {
    to: "/vehicles",
    label: "Véhicules",
    icon: Car,
    roles: ["admin", "secretary", "superadmin"],
    group: "Opérations",
  },

  {
    to: "/payments",
    label: "Paiements",
    icon: CreditCard,
    roles: ["admin", "secretary", "student", "superadmin"],
    group: "Administration",
  },
  {
    to: "/documents",
    label: "Documents",
    icon: FileText,
    roles: ["admin", "secretary", "student", "superadmin"],
    group: "Administration",
  },
  {
    to: "/messages",
    label: "Messagerie",
    icon: MessageSquare,
    roles: ["admin", "secretary", "instructor", "student", "superadmin"],
    group: "Administration",
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: Bell,
    roles: ["admin", "secretary", "instructor", "student", "superadmin"],
    group: "Administration",
  },
  {
    to: "/settings",
    label: "Paramètres",
    icon: Settings,
    roles: ["admin", "superadmin"],
    group: "Administration",
  },
];

export const NAV_GROUPS = ["Pilotage", "Formation", "Évaluation", "Opérations", "Administration"];

export function navForRole(role: Role) {
  return NAV_ITEMS.filter((i) => i.roles.includes(role));
}
