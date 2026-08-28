import { useSession } from "@/lib/session";

/** Convenience accessor: guaranteed session inside the authenticated shell. */
export function useOrg() {
  const { session } = useSession();
  if (!session) throw new Error("Session requise");
  return {
    session,
    orgId: session.organizationId,
    role: session.user.role,
    studentId: session.studentId,
    instructorId: session.instructorId,
  };
}
