import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SubmitStatus = "idle" | "loading" | "success";

interface AuthSubmitProps {
  status: SubmitStatus;
  children: ReactNode;
  className?: string;
}

/** Bouton d'envoi avec retour visuel chargement → succès, piloté par `status`. */
export function AuthSubmit({ status, children, className }: AuthSubmitProps) {
  return (
    <Button
      type="submit"
      disabled={status !== "idle"}
      className={cn(
        "h-11 w-full text-[0.95rem] font-semibold",
        status === "success" && "bg-success text-success-foreground hover:bg-success",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === "loading" ? (
          <motion.span
            key="loading"
            className="inline-flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <Loader2 className="size-4 animate-spin" /> Vérification…
          </motion.span>
        ) : status === "success" ? (
          <motion.span
            key="success"
            className="inline-flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="size-4" /> C'est bon !
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            className="inline-flex items-center gap-2"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}