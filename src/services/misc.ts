import { delay, nextId, scoped, store } from "./client";
import type { CalendarEvent, DrivingSession, Vehicle } from "@/types";

export const vehiclesService = {
  async list(organizationId: string) {
    return delay(scoped(store().vehicles, organizationId));
  },
  async create(
    organizationId: string,
    input: Omit<Vehicle, "id" | "organizationId" | "maintenance">,
  ) {
    const vehicle: Vehicle = { ...input, id: nextId("veh"), organizationId, maintenance: [] };
    store().vehicles.unshift(vehicle);
    return delay(vehicle);
  },
};

export const drivingService = {
  async list(organizationId: string, filters: { studentId?: string; instructorId?: string } = {}) {
    let rows = scoped(store().sessions, organizationId);
    if (filters.studentId) rows = rows.filter((s) => s.studentId === filters.studentId);
    if (filters.instructorId) rows = rows.filter((s) => s.instructorId === filters.instructorId);
    return delay(rows.sort((a, b) => a.start.localeCompare(b.start)));
  },
  async create(organizationId: string, input: Omit<DrivingSession, "id" | "organizationId">) {
    const session: DrivingSession = { ...input, id: nextId("ses"), organizationId };
    store().sessions.unshift(session);
    store().events.unshift({
      id: nextId("evt"),
      organizationId,
      title: "Séance de conduite",
      type: "driving",
      start: session.start,
      end: session.end,
      studentId: session.studentId,
      instructorId: session.instructorId,
      vehicleId: session.vehicleId,
    });
    return delay(session);
  },
  conflicts(
    organizationId: string,
    draft: {
      start: string;
      end: string;
      instructorId: string;
      vehicleId: string;
      studentId: string;
    },
  ) {
    return scoped(store().sessions, organizationId).filter(
      (s) =>
        s.status !== "cancelled" &&
        s.start < draft.end &&
        draft.start < s.end &&
        (s.instructorId === draft.instructorId ||
          s.vehicleId === draft.vehicleId ||
          s.studentId === draft.studentId),
    );
  },
};

export const calendarService = {
  async list(organizationId: string, filters: { instructorId?: string; studentId?: string } = {}) {
    let rows: CalendarEvent[] = scoped(store().events, organizationId);
    if (filters.instructorId) rows = rows.filter((e) => e.instructorId === filters.instructorId);
    if (filters.studentId)
      rows = rows.filter((e) => e.studentId === filters.studentId || !e.studentId);
    return delay(rows.sort((a, b) => a.start.localeCompare(b.start)));
  },
};

export const paymentsService = {
  async list(organizationId: string, filters: { studentId?: string } = {}) {
    let rows = scoped(store().payments, organizationId);
    if (filters.studentId) rows = rows.filter((p) => p.studentId === filters.studentId);
    return delay(rows);
  },
  async pay(organizationId: string, paymentId: string, amount: number) {
    const payment = scoped(store().payments, organizationId).find((p) => p.id === paymentId);
    if (!payment) throw new Error("Paiement introuvable");
    payment.paid = Math.min(payment.total, payment.paid + amount);
    payment.history.push({ date: new Date().toISOString(), amount, method: "card" });
    return delay(payment);
  },
};

export const documentsService = {
  async list(organizationId: string, filters: { studentId?: string; category?: string } = {}) {
    let rows = scoped(store().documents, organizationId);
    if (filters.studentId) rows = rows.filter((d) => d.studentId === filters.studentId);
    if (filters.category && filters.category !== "all")
      rows = rows.filter((d) => d.category === filters.category);
    return delay(rows);
  },
  async upload(
    organizationId: string,
    input: {
      name: string;
      category: "contract" | "identity" | "medical" | "certificate" | "invoice";
      studentId?: string;
    },
  ) {
    const doc = {
      ...input,
      id: nextId("doc"),
      organizationId,
      sizeKb: 240,
      uploadedAt: new Date().toISOString(),
    };
    store().documents.unshift(doc);
    return delay(doc);
  },
};

export const attendanceService = {
  async list(organizationId: string, filters: { studentId?: string; groupId?: string } = {}) {
    let rows = scoped(store().attendances, organizationId);
    if (filters.studentId) rows = rows.filter((a) => a.studentId === filters.studentId);
    if (filters.groupId) rows = rows.filter((a) => a.groupId === filters.groupId);
    return delay(rows.sort((a, b) => b.date.localeCompare(a.date)));
  },
  async mark(
    organizationId: string,
    attendanceId: string,
    status: "present" | "absent" | "late" | "excused",
  ) {
    const row = scoped(store().attendances, organizationId).find((a) => a.id === attendanceId);
    if (!row) throw new Error("Présence introuvable");
    row.status = status;
    return delay(row);
  },
};

export const coursesService = {
  async list(organizationId: string) {
    return delay(scoped(store().courses, organizationId));
  },
  async get(organizationId: string, courseId: string) {
    return delay(scoped(store().courses, organizationId).find((c) => c.id === courseId) ?? null);
  },
};

export const messagingService = {
  async list(organizationId: string) {
    return delay(scoped(store().conversations, organizationId));
  },
  async send(organizationId: string, conversationId: string, authorId: string, body: string) {
    const conv = scoped(store().conversations, organizationId).find((c) => c.id === conversationId);
    if (!conv) throw new Error("Conversation introuvable");
    conv.messages.push({ id: nextId("msg"), authorId, body, at: new Date().toISOString() });
    return delay(conv);
  },
};

export const notificationsService = {
  async list(organizationId: string) {
    return delay(
      scoped(store().notifications, organizationId).sort((a, b) => b.at.localeCompare(a.at)),
    );
  },
  async markAllRead(organizationId: string) {
    scoped(store().notifications, organizationId).forEach((n) => (n.read = true));
    return delay(true);
  },
};

export const organizationsService = {
  async list() {
    return delay(store().organizations);
  },
  async get(organizationId: string) {
    return delay(store().organizations.find((o) => o.id === organizationId) ?? null);
  },
  async update(
    organizationId: string,
    patch: Partial<{
      status: "active" | "trial" | "suspended";
      licenseExpiresAt: string;
      licensePlan: "starter" | "pro" | "enterprise";
    }>,
  ) {
    const org = store().organizations.find((o) => o.id === organizationId);
    if (!org) throw new Error("Établissement introuvable");
    Object.assign(org, patch);
    return delay(org);
  },
  async platformStats() {
    const d = store();
    return delay({
      totalSchools: d.organizations.length,
      activeSchools: d.organizations.filter((o) => o.status === "active").length,
      trialSchools: d.organizations.filter((o) => o.status === "trial").length,
      expiringSoon: d.organizations.filter(
        (o) => new Date(o.licenseExpiresAt).getTime() - Date.now() < 45 * 86400000,
      ).length,
      totalUsers: d.users.length,
      totalStudents: d.students.length,
      revenue: d.organizations.reduce((sum, o) => sum + o.monthlyRevenue, 0),
      growth: 12.4,
    });
  },
};
