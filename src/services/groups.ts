import { delay, nextId, scoped, store } from "./client";
import type { Group, LicenseCategory } from "@/types";

export const groupsService = {
  async list(organizationId: string) {
    return delay(scoped(store().groups, organizationId));
  },
  async get(organizationId: string, groupId: string) {
    return delay(scoped(store().groups, organizationId).find((g) => g.id === groupId) ?? null);
  },
  async create(
    organizationId: string,
    input: {
      name: string;
      category: LicenseCategory;
      instructorId: string;
      startDate: string;
      endDate: string;
    },
  ) {
    const group: Group = {
      ...input,
      id: nextId("grp"),
      organizationId,
      studentIds: [],
      averageProgress: 0,
    };
    store().groups.unshift(group);
    return delay(group);
  },
  async update(organizationId: string, groupId: string, patch: Partial<Group>) {
    const group = scoped(store().groups, organizationId).find((g) => g.id === groupId);
    if (!group) throw new Error("Groupe introuvable");
    Object.assign(group, patch);
    return delay(group);
  },
  async remove(organizationId: string, groupId: string) {
    const d = store();
    d.groups = d.groups.filter((g) => !(g.id === groupId && g.organizationId === organizationId));
    return delay(true);
  },
};
