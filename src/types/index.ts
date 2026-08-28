export type Role = "superadmin" | "admin" | "secretary" | "instructor" | "student";

export type LicenseCategory = "A" | "A1" | "B" | "BE" | "C" | "D";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  city: string;
  status: "active" | "trial" | "suspended";
  licensePlan: "starter" | "pro" | "enterprise";
  licenseExpiresAt: string;
  createdAt: string;
  lastActivityAt: string;
  monthlyRevenue: number;
  primaryColor: string;
}

export interface User {
  id: string;
  organizationIds: string[];
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string | undefined;
  status: "active" | "invited" | "suspended";
  createdAt: string;
}

export interface Student {
  id: string;
  organizationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  category: LicenseCategory;
  enrolledAt: string;
  status: "active" | "paused" | "graduated" | "archived";
  groupId?: string | undefined;
  instructorId?: string | undefined;
  theoryProgress: number;
  practiceProgress: number;
  average: number;
  drivingHours: number;
  requiredHours: number;
  skills: SkillProgress[];
}

export interface Instructor {
  id: string;
  organizationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialties: LicenseCategory[];
  studentCount: number;
  sessionsThisWeek: number;
  rating: number;
  availability: "available" | "busy" | "off";
  hiredAt: string;
}

export interface Group {
  id: string;
  organizationId: string;
  name: string;
  category: LicenseCategory;
  instructorId: string;
  studentIds: string[];
  startDate: string;
  endDate: string;
  averageProgress: number;
}

export interface Vehicle {
  id: string;
  organizationId: string;
  brand: string;
  model: string;
  plate: string;
  category: LicenseCategory;
  mileage: number;
  status: "available" | "in_use" | "maintenance";
  insuranceExpiresAt: string;
  inspectionExpiresAt: string;
  maintenance: { date: string; label: string; cost: number }[];
}

export type SkillKey =
  | "start"
  | "braking"
  | "clutch"
  | "gear"
  | "parking"
  | "reverse"
  | "hill_start"
  | "intersections"
  | "roundabouts"
  | "lane_change"
  | "overtaking"
  | "traffic";

export interface SkillProgress {
  key: SkillKey;
  level: number;
}

export interface DrivingSession {
  id: string;
  organizationId: string;
  studentId: string;
  instructorId: string;
  vehicleId: string;
  start: string;
  end: string;
  status: "planned" | "done" | "cancelled";
  notes?: string | undefined;
  skillsReviewed: SkillProgress[];
}

export interface CalendarEvent {
  id: string;
  organizationId: string;
  title: string;
  type: "driving" | "course" | "exam" | "meeting";
  start: string;
  end: string;
  instructorId?: string | undefined;
  studentId?: string | undefined;
  vehicleId?: string | undefined;
  groupId?: string | undefined;
}

export interface Question {
  id: string;
  organizationId: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  text: string;
  imageUrl?: string | undefined;
  choices: string[];
  correctIndex: number;
  explanation: string;
  usageCount: number;
}

export interface Assignment {
  id: string;
  organizationId: string;
  instructorId: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  durationMin: number;
  attempts: number;
  startAt: string;
  dueAt: string;
  status: "draft" | "published" | "completed" | "expired";
  questionIds: string[];
  targetGroupId?: string | undefined;
  targetStudentIds: string[];
  createdAt: string;
}

export interface Submission {
  id: string;
  organizationId: string;
  assignmentId: string;
  studentId: string;
  score: number | null;
  submittedAt: string | null;
  answers: Record<string, number>;
}

export interface Exam {
  id: string;
  organizationId: string;
  title: string;
  type: "theory" | "practice";
  date: string;
  durationMin: number;
  questionIds: string[];
  groupId?: string | undefined;
  status: "draft" | "published" | "done";
  passRate: number;
}

export interface ExamResult {
  id: string;
  organizationId: string;
  examId: string;
  studentId: string;
  score: number;
  passed: boolean;
  takenAt: string;
}

export interface Course {
  id: string;
  organizationId: string;
  title: string;
  category: string;
  description: string;
  chapters: {
    id: string;
    title: string;
    lessons: { id: string; title: string; type: "video" | "doc" | "quiz"; durationMin: number }[];
  }[];
  progress: number;
}

export interface Payment {
  id: string;
  organizationId: string;
  studentId: string;
  total: number;
  paid: number;
  method: "card" | "cash" | "transfer";
  status: "paid" | "partial" | "late";
  date: string;
  history: { date: string; amount: number; method: string }[];
}

export interface DocumentItem {
  id: string;
  organizationId: string;
  studentId?: string | undefined;
  name: string;
  category: "contract" | "identity" | "medical" | "certificate" | "invoice";
  sizeKb: number;
  uploadedAt: string;
  expiresAt?: string | undefined;
}

export interface Attendance {
  id: string;
  organizationId: string;
  studentId: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  groupId?: string | undefined;
}

export interface Conversation {
  id: string;
  organizationId: string;
  subject: string;
  participantIds: string[];
  kind: "direct" | "group" | "announcement";
  messages: { id: string; authorId: string; body: string; at: string }[];
}

export interface Notification {
  id: string;
  organizationId: string;
  userId?: string | undefined;
  type: "assignment" | "exam" | "session" | "message" | "payment" | "document" | "announcement";
  title: string;
  body: string;
  at: string;
  read: boolean;
}

export interface TimelineEntry {
  id: string;
  at: string;
  label: string;
  detail: string;
  kind: "exam" | "assignment" | "session" | "payment" | "document" | "admin";
}

export interface SessionUser {
  user: User;
  organizationId: string;
  studentId?: string | undefined;
  instructorId?: string | undefined;
}
