import { delay, nextId, scoped, store } from "./client";
import type { Assignment, Submission } from "@/types";

export const assignmentsService = {
  async list(
    organizationId: string,
    filters: { status?: string; instructorId?: string; studentId?: string } = {},
  ) {
    let rows = scoped(store().assignments, organizationId);
    if (filters.status && filters.status !== "all")
      rows = rows.filter((a) => a.status === filters.status);
    if (filters.instructorId) rows = rows.filter((a) => a.instructorId === filters.instructorId);
    if (filters.studentId)
      rows = rows.filter(
        (a) => a.status !== "draft" && a.targetStudentIds.includes(filters.studentId!),
      );
    return delay(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },
  async get(organizationId: string, assignmentId: string) {
    return delay(
      scoped(store().assignments, organizationId).find((a) => a.id === assignmentId) ?? null,
    );
  },
  async submissions(organizationId: string, assignmentId: string) {
    return delay(
      scoped(store().submissions, organizationId).filter((s) => s.assignmentId === assignmentId),
    );
  },
  async submissionFor(organizationId: string, assignmentId: string, studentId: string) {
    return delay(
      scoped(store().submissions, organizationId).find(
        (s) => s.assignmentId === assignmentId && s.studentId === studentId,
      ) ?? null,
    );
  },
  async create(
    organizationId: string,
    input: Omit<Assignment, "id" | "organizationId" | "createdAt">,
  ) {
    const assignment: Assignment = {
      ...input,
      id: nextId("asg"),
      organizationId,
      createdAt: new Date().toISOString(),
    };
    store().assignments.unshift(assignment);
    if (assignment.status === "published") {
      assignment.targetStudentIds.forEach((sid) => {
        const submission: Submission = {
          id: nextId("sub"),
          organizationId,
          assignmentId: assignment.id,
          studentId: sid,
          score: null,
          submittedAt: null,
          answers: {},
        };
        store().submissions.push(submission);
      });
      store().notifications.unshift({
        id: nextId("ntf"),
        organizationId,
        type: "assignment",
        title: "Nouveau devoir publié",
        body: assignment.title,
        at: new Date().toISOString(),
        read: false,
      });
    }
    return delay(assignment);
  },
  async submit(
    organizationId: string,
    assignmentId: string,
    studentId: string,
    answers: Record<string, number>,
  ) {
    const d = store();
    const assignment = scoped(d.assignments, organizationId).find((a) => a.id === assignmentId);
    if (!assignment) throw new Error("Devoir introuvable");
    const correct = assignment.questionIds.filter((qid) => {
      const q = d.questions.find((x) => x.id === qid);
      return q && answers[qid] === q.correctIndex;
    }).length;
    const score = Math.round((correct / Math.max(assignment.questionIds.length, 1)) * 100);
    let submission = d.submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId,
    );
    if (!submission) {
      submission = {
        id: nextId("sub"),
        organizationId,
        assignmentId,
        studentId,
        score,
        submittedAt: new Date().toISOString(),
        answers,
      };
      d.submissions.push(submission);
    } else {
      submission.score = score;
      submission.submittedAt = new Date().toISOString();
      submission.answers = answers;
    }
    return delay(submission);
  },
};
