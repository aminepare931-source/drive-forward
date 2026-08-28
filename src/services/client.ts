import { db, nextId } from "@/mocks/db";

export const LATENCY = 220;

export function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const store = db;
export { nextId };

/** Every read is scoped by organizationId — the multi-tenant boundary. */
export function scoped<T extends { organizationId: string }>(rows: T[], organizationId: string) {
  return rows.filter((r) => r.organizationId === organizationId);
}
