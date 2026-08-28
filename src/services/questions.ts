import { delay, nextId, scoped, store } from "./client";
import type { Question } from "@/types";

export const questionsService = {
  async list(
    organizationId: string,
    filters: { search?: string; category?: string; difficulty?: string } = {},
  ) {
    let rows = scoped(store().questions, organizationId);
    if (filters.search?.trim())
      rows = rows.filter((q) => q.text.toLowerCase().includes(filters.search!.toLowerCase()));
    if (filters.category && filters.category !== "all")
      rows = rows.filter((q) => q.category === filters.category);
    if (filters.difficulty && filters.difficulty !== "all")
      rows = rows.filter((q) => q.difficulty === filters.difficulty);
    return delay(rows);
  },
  async byIds(organizationId: string, ids: string[]) {
    return delay(scoped(store().questions, organizationId).filter((q) => ids.includes(q.id)));
  },
  async create(
    organizationId: string,
    input: Omit<Question, "id" | "organizationId" | "usageCount">,
  ) {
    const question: Question = { ...input, id: nextId("qst"), organizationId, usageCount: 0 };
    store().questions.unshift(question);
    return delay(question);
  },
};
