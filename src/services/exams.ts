import { delay, nextId, scoped, store } from "./client";
import type { Exam, ExamResult } from "@/types";

export const examsService = {
  async list(organizationId: string, filters: { status?: string } = {}) {
    let rows = scoped(store().exams, organizationId);
    if (filters.status && filters.status !== "all")
      rows = rows.filter((e) => e.status === filters.status);
    return delay(rows);
  },
  async get(organizationId: string, examId: string) {
    return delay(scoped(store().exams, organizationId).find((e) => e.id === examId) ?? null);
  },
  async results(organizationId: string, filters: { examId?: string; studentId?: string } = {}) {
    let rows = scoped(store().examResults, organizationId);
    if (filters.examId) rows = rows.filter((r) => r.examId === filters.examId);
    if (filters.studentId) rows = rows.filter((r) => r.studentId === filters.studentId);
    return delay(rows.sort((a, b) => b.takenAt.localeCompare(a.takenAt)));
  },
  async create(organizationId: string, input: Omit<Exam, "id" | "organizationId" | "passRate">) {
    const exam: Exam = { ...input, id: nextId("exm"), organizationId, passRate: 0 };
    store().exams.unshift(exam);
    return delay(exam);
  },
  async submit(
    organizationId: string,
    examId: string,
    studentId: string,
    answers: Record<string, number>,
  ) {
    const d = store();
    const exam = scoped(d.exams, organizationId).find((e) => e.id === examId);
    if (!exam) throw new Error("Examen introuvable");
    const correct = exam.questionIds.filter((qid) => {
      const q = d.questions.find((x) => x.id === qid);
      return q && answers[qid] === q.correctIndex;
    }).length;
    const score = Math.round((correct / Math.max(exam.questionIds.length, 1)) * 100);
    const result: ExamResult = {
      id: nextId("exr"),
      organizationId,
      examId,
      studentId,
      score,
      passed: score >= 70,
      takenAt: new Date().toISOString(),
    };
    d.examResults.unshift(result);
    return delay(result);
  },
};
