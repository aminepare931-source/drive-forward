import { delay, nextId, scoped, store } from "./client";
import type { Instructor } from "@/types";

export const instructorsService = {
  async list(organizationId: string, search = "") {
    let rows = scoped(store().instructors, organizationId);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((i) =>
        `${i.firstName} ${i.lastName} ${i.email}`.toLowerCase().includes(q),
      );
    }
    return delay(rows);
  },
  async get(organizationId: string, instructorId: string) {
    return delay(
      scoped(store().instructors, organizationId).find((i) => i.id === instructorId) ?? null,
    );
  },
  async byUserId(organizationId: string, userId: string) {
    return delay(
      scoped(store().instructors, organizationId).find((i) => i.userId === userId) ?? null,
    );
  },
  async create(
    organizationId: string,
    input: Pick<
      Instructor,
      "firstName" | "lastName" | "email" | "phone" | "specialties" | "availability"
    >,
  ) {
    const instructor: Instructor = {
      ...input,
      id: nextId("ins"),
      organizationId,
      userId: nextId("usr"),
      studentCount: 0,
      sessionsThisWeek: 0,
      rating: 0,
      hiredAt: new Date().toISOString(),
    };
    store().instructors.unshift(instructor);
    return delay(instructor);
  },
};
