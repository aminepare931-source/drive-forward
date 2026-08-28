import { delay, nextId, scoped, store } from "./client";
import type { Student, TimelineEntry } from "@/types";

export interface StudentQuery {
  search?: string;
  status?: string;
  groupId?: string;
  instructorId?: string;
  page?: number;
  pageSize?: number;
}

export const studentsService = {
  async list(organizationId: string, query: StudentQuery = {}) {
    const { search = "", status = "all", groupId, instructorId, page = 1, pageSize = 12 } = query;
    let rows = scoped(store().students, organizationId);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((s) =>
        `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(q),
      );
    }
    if (status !== "all") rows = rows.filter((s) => s.status === status);
    if (groupId) rows = rows.filter((s) => s.groupId === groupId);
    if (instructorId) rows = rows.filter((s) => s.instructorId === instructorId);
    const total = rows.length;
    const items = rows.slice((page - 1) * pageSize, page * pageSize);
    return delay({ items, total, page, pageSize });
  },

  async get(organizationId: string, studentId: string) {
    const student =
      scoped(store().students, organizationId).find((s) => s.id === studentId) ?? null;
    return delay(student);
  },

  async byUserId(organizationId: string, userId: string) {
    return delay(scoped(store().students, organizationId).find((s) => s.userId === userId) ?? null);
  },

  async create(
    organizationId: string,
    input: Omit<
      Student,
      | "id"
      | "organizationId"
      | "userId"
      | "skills"
      | "theoryProgress"
      | "practiceProgress"
      | "average"
      | "drivingHours"
      | "requiredHours"
    >,
  ) {
    const student: Student = {
      ...input,
      id: nextId("std"),
      organizationId,
      userId: nextId("usr"),
      theoryProgress: 0,
      practiceProgress: 0,
      average: 0,
      drivingHours: 0,
      requiredHours: 30,
      skills: [],
    };
    store().students.unshift(student);
    if (student.groupId) {
      store()
        .groups.find((g) => g.id === student.groupId)
        ?.studentIds.push(student.id);
    }
    return delay(student);
  },

  async update(organizationId: string, studentId: string, patch: Partial<Student>) {
    const student = scoped(store().students, organizationId).find((s) => s.id === studentId);
    if (!student) throw new Error("Élève introuvable");
    Object.assign(student, patch);
    return delay(student);
  },

  async archive(organizationId: string, studentId: string) {
    return studentsService.update(organizationId, studentId, { status: "archived" });
  },

  async timeline(organizationId: string, studentId: string): Promise<TimelineEntry[]> {
    const d = store();
    const entries: TimelineEntry[] = [];
    scoped(d.examResults, organizationId)
      .filter((r) => r.studentId === studentId)
      .forEach((r) =>
        entries.push({
          id: r.id,
          at: r.takenAt,
          kind: "exam",
          label: r.passed ? "Examen réussi" : "Examen échoué",
          detail: `Score ${r.score}%`,
        }),
      );
    scoped(d.submissions, organizationId)
      .filter((s) => s.studentId === studentId && s.submittedAt)
      .forEach((s) =>
        entries.push({
          id: s.id,
          at: s.submittedAt!,
          kind: "assignment",
          label: "Devoir remis",
          detail: `Note ${s.score}%`,
        }),
      );
    scoped(d.sessions, organizationId)
      .filter((s) => s.studentId === studentId)
      .forEach((s) =>
        entries.push({
          id: s.id,
          at: s.start,
          kind: "session",
          label: "Séance de conduite",
          detail: s.notes ?? "",
        }),
      );
    scoped(d.payments, organizationId)
      .filter((p) => p.studentId === studentId)
      .forEach((p) =>
        p.history.forEach((h, i) =>
          entries.push({
            id: `${p.id}_${i}`,
            at: h.date,
            kind: "payment",
            label: "Paiement enregistré",
            detail: `${h.amount} $ • ${h.method}`,
          }),
        ),
      );
    return delay(entries.sort((a, b) => b.at.localeCompare(a.at)));
  },
};
