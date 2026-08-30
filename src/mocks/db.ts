import type {
  Assignment,
  Attendance,
  CalendarEvent,
  Conversation,
  Course,
  DocumentItem,
  DrivingSession,
  Exam,
  ExamResult,
  Group,
  Instructor,
  LicenseCategory,
  Notification,
  Organization,
  Payment,
  Question,
  SkillKey,
  SkillProgress,
  Student,
  Submission,
  User,
  Vehicle,
} from "@/types";

export const SKILL_KEYS: SkillKey[] = [
  "start",
  "braking",
  "clutch",
  "gear",
  "parking",
  "reverse",
  "hill_start",
  "intersections",
  "roundabouts",
  "lane_change",
  "overtaking",
  "traffic",
];

export const QUESTION_CATEGORIES = [
  "Signalisation",
  "Priorités",
  "Intersections",
  "Circulation",
  "Stationnement",
  "Dépassement",
  "Sécurité",
  "Mécanique de base",
];

export interface Database {
  organizations: Organization[];
  users: User[];
  students: Student[];
  instructors: Instructor[];
  groups: Group[];
  vehicles: Vehicle[];
  sessions: DrivingSession[];
  events: CalendarEvent[];
  questions: Question[];
  assignments: Assignment[];
  submissions: Submission[];
  exams: Exam[];
  examResults: ExamResult[];
  courses: Course[];
  payments: Payment[];
  documents: DocumentItem[];
  attendances: Attendance[];
  conversations: Conversation[];
  notifications: Notification[];
}

function build(): Database {
  const now = new Date().toISOString();
  const orgId = "org_demo";
  const directorUserId = "usr_demo_director";
  const instructorUserId = "usr_demo_instructor";
  const studentUserId = "usr_demo_student";
  const instructorId = "ins_demo";
  const studentId = "stu_demo";
  const vehicleId = "veh_demo";

  return {
    organizations: [
      {
        id: orgId,
        name: "Auto-École Démo",
        slug: "auto-ecole-demo",
        city: "Ouagadougou",
        status: "trial",
        licensePlan: "pro",
        licenseExpiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: now,
        lastActivityAt: now,
        monthlyRevenue: 0,
        primaryColor: "oklch(0.42 0.13 258)",
      },
    ],
    users: [
      {
        id: directorUserId,
        organizationIds: [orgId],
        role: "admin",
        firstName: "Fatou",
        lastName: "Compaoré",
        email: "demo.directeur@drivehub.test",
        phone: "70 00 00 01",
        status: "active",
        createdAt: now,
      },
      {
        id: instructorUserId,
        organizationIds: [orgId],
        role: "instructor",
        firstName: "Boubacar",
        lastName: "Sawadogo",
        email: "demo.moniteur@drivehub.test",
        phone: "70 00 00 02",
        status: "active",
        createdAt: now,
      },
      {
        id: studentUserId,
        organizationIds: [orgId],
        role: "student",
        firstName: "Aïcha",
        lastName: "Ouédraogo",
        email: "demo.eleve@drivehub.test",
        phone: "70 00 00 03",
        status: "active",
        createdAt: now,
      },
    ],
    students: [
      {
        id: studentId,
        organizationId: orgId,
        userId: studentUserId,
        firstName: "Aïcha",
        lastName: "Ouédraogo",
        email: "demo.eleve@drivehub.test",
        phone: "70 00 00 03",
        birthDate: "2003-04-12",
        address: "Ouagadougou",
        category: "B",
        enrolledAt: now,
        status: "active",
        instructorId,
        theoryProgress: 62,
        practiceProgress: 40,
        average: 71,
        drivingHours: 8,
        requiredHours: 20,
        skills: [],
      },
    ],
    instructors: [
      {
        id: instructorId,
        organizationId: orgId,
        userId: instructorUserId,
        firstName: "Boubacar",
        lastName: "Sawadogo",
        email: "demo.moniteur@drivehub.test",
        phone: "70 00 00 02",
        specialties: ["B", "A"],
        studentCount: 1,
        sessionsThisWeek: 0,
        rating: 4.8,
        availability: "available",
        hiredAt: now,
      },
    ],
    groups: [],
    vehicles: [
      {
        id: vehicleId,
        organizationId: orgId,
        brand: "Toyota",
        model: "Yaris",
        plate: "11-BF-1234",
        category: "B",
        mileage: 18000,
        status: "available",
        insuranceExpiresAt: new Date(Date.now() + 200 * 86400000).toISOString(),
        inspectionExpiresAt: new Date(Date.now() + 150 * 86400000).toISOString(),
        maintenance: [],
      },
    ],
    sessions: [],
    events: [],
    questions: [],
    assignments: [],
    submissions: [],
    exams: [],
    examResults: [],
    courses: [],
    payments: [],
    documents: [],
    attendances: [],
    conversations: [],
    notifications: [],
  };
}

let cache: Database | null = null;

export function db(): Database {
  if (!cache) cache = build();
  return cache;
}

export function nextId(prefix: string) {
  return `${prefix}_${Math.floor(Date.now() % 100000)}_${Math.floor(Math.random() * 1000)}`;
}
