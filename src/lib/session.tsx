import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { db } from "@/mocks/db";
import type { Role, SessionUser, User } from "@/types";

const STORAGE_KEY = "autoecole.session";

function resolve(user: User, organizationId: string): SessionUser {
  const d = db();
  return {
    user,
    organizationId,
    studentId: d.students.find((s) => s.userId === user.id)?.id,
    instructorId: d.instructors.find((i) => i.userId === user.id)?.id,
  };
}

export function findUserByEmail(email: string): User | null {
  const target = email.trim().toLowerCase();
  const d = db();
  return d.users.find((u) => u.email.toLowerCase() === target) ?? null;
}

interface SessionContextValue {
  session: SessionUser | null;
  ready: boolean;
  login: (email: string) => SessionUser | null;
  logout: () => void;
  switchOrganization: (organizationId: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { userId: string; organizationId: string };
        const user = db().users.find((u) => u.id === parsed.userId);
        if (user) setSession(resolve(user, parsed.organizationId));
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: SessionUser | null) => {
    setSession(next);
    if (next)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ userId: next.user.id, organizationId: next.organizationId }),
      );
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      ready,
      login: (email) => {
        const user = findUserByEmail(email);
        if (!user) return null;
        const next = resolve(user, user.organizationIds[0] ?? "");
        persist(next);
        return next;
      },
      logout: () => persist(null),
      switchOrganization: (organizationId) => {
        if (!session) return;
        persist({ ...session, organizationId });
      },
    }),
    [session, ready, persist],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession doit être utilisé dans SessionProvider");
  return ctx;
}

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super admin",
  admin: "Administrateur",
  secretary: "Secrétaire",
  instructor: "Moniteur",
  student: "Élève",
};
