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
  return {
    organizations: [],
    users: [],
    students: [],
    instructors: [],
    groups: [],
    vehicles: [],
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
