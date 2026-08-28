import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAP: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-success/15 text-success border-success/30" },
  paused: {
    label: "En pause",
    className: "bg-warning/20 text-warning-foreground border-warning/40",
  },
  graduated: { label: "Diplômé", className: "bg-primary/10 text-primary border-primary/25" },
  archived: { label: "Archivé", className: "bg-muted text-muted-foreground border-border" },
  trial: { label: "Essai", className: "bg-warning/20 text-warning-foreground border-warning/40" },
  suspended: {
    label: "Suspendu",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  available: { label: "Disponible", className: "bg-success/15 text-success border-success/30" },
  in_use: { label: "En service", className: "bg-primary/10 text-primary border-primary/25" },
  maintenance: {
    label: "Maintenance",
    className: "bg-warning/20 text-warning-foreground border-warning/40",
  },
  busy: { label: "Occupé", className: "bg-warning/20 text-warning-foreground border-warning/40" },
  off: { label: "Absent", className: "bg-muted text-muted-foreground border-border" },
  draft: { label: "Brouillon", className: "bg-muted text-muted-foreground border-border" },
  published: { label: "Publié", className: "bg-success/15 text-success border-success/30" },
  completed: { label: "Terminé", className: "bg-primary/10 text-primary border-primary/25" },
  expired: {
    label: "Expiré",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  done: { label: "Terminé", className: "bg-primary/10 text-primary border-primary/25" },
  paid: { label: "Payé", className: "bg-success/15 text-success border-success/30" },
  partial: {
    label: "Partiel",
    className: "bg-warning/20 text-warning-foreground border-warning/40",
  },
  late: {
    label: "En retard",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  present: { label: "Présent", className: "bg-success/15 text-success border-success/30" },
  absent: {
    label: "Absent",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  excused: { label: "Excusé", className: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status }: { status: string }) {
  const item = MAP[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", item.className)}>
      {item.label}
    </Badge>
  );
}
