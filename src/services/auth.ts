import { delay, nextId, store } from "./client";
import type { LicenseCategory, Organization, User } from "@/types";

/** Type de profil choisi à l'inscription. */
export type RegisterKind = "student" | "director";

export interface StudentRegistration {
  kind: "student";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  category: LicenseCategory;
}

export interface DirectorRegistration {
  kind: "director";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  schoolName: string;
  city: string;
}

export type RegisterInput = StudentRegistration | DirectorRegistration;

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "etablissement"
  );
}

const now = () => new Date().toISOString();

/**
 * Crée un compte et le rattache au bon profil.
 *
 * - `student`  : crée l'utilisateur (rôle élève) + sa fiche de suivi `Student`.
 * - `director` : crée l'utilisateur (rôle admin, le "directeur") ET son propre
 *   établissement (`Organization`), puis y rattache le compte.
 *
 * L'inscription s'appuie sur le même dépôt que le login : une fois créé,
 * l'utilisateur est immédiatement retrouvable par `findUserByEmail`.
 */
export const authService = {
  async register(input: RegisterInput) {
    const d = store();
    const email = input.email.trim().toLowerCase();

    if (d.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error("Un compte existe déjà avec cette adresse e-mail.");
    }

    if (input.kind === "director") {
      const schoolName = input.schoolName.trim();
      const org: Organization = {
        id: nextId("org"),
        name: schoolName,
        slug: slugify(schoolName),
        city: input.city.trim(),
        status: "trial",
        licensePlan: "pro",
        licenseExpiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: now(),
        lastActivityAt: now(),
        monthlyRevenue: 0,
        primaryColor: "oklch(0.42 0.13 258)",
      };
      d.organizations.unshift(org);

      const user: User = {
        id: nextId("usr"),
        organizationIds: [org.id],
        role: "admin",
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email,
        phone: input.phone.trim(),
        status: "active",
        createdAt: now(),
      };

      d.users.push(user);
      return delay(user);
    }

    // Rôle élève : sans établissement propre, rejoindra une école existante.
    const user: User = {
      id: nextId("usr"),
      organizationIds: [],
      role: "student",
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      phone: input.phone.trim(),
      status: "active",
      createdAt: now(),
    };

    d.users.push(user);
    d.students.unshift({
      id: nextId("std"),
      organizationId: "",
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email,
      phone: user.phone,
      birthDate: input.birthDate,
      address: "",
      category: input.category,
      enrolledAt: now(),
      status: "active",
      theoryProgress: 0,
      practiceProgress: 0,
      average: 0,
      drivingHours: 0,
      requiredHours: 30,
      skills: [],
    });

    return delay(user);
  },
};