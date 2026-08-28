import { delay, scoped, store } from "./client";

function sameDay(iso: string, ref = new Date()) {
  const d = new Date(iso);
  return (
    d.getUTCFullYear() === ref.getUTCFullYear() &&
    d.getUTCMonth() === ref.getUTCMonth() &&
    d.getUTCDate() === ref.getUTCDate()
  );
}

export const dashboardService = {
  async school(organizationId: string) {
    const d = store();
    const students = scoped(d.students, organizationId);
    const results = scoped(d.examResults, organizationId);
    const submissions = scoped(d.submissions, organizationId);
    const payments = scoped(d.payments, organizationId);
    return delay({
      students: students.length,
      instructors: scoped(d.instructors, organizationId).length,
      todaySessions: scoped(d.sessions, organizationId).filter((s) => sameDay(s.start)).length,
      upcomingExams: scoped(d.exams, organizationId).filter((e) => new Date(e.date) > new Date())
        .length,
      toGrade: submissions.filter((s) => s.submittedAt && s.score === null).length,
      outstanding: payments.reduce((sum, p) => sum + (p.total - p.paid), 0),
      strugglingStudents: students.filter((s) => s.average < 60).length,
      successRate: results.length
        ? Math.round((results.filter((r) => r.passed).length / results.length) * 100)
        : 0,
      progressChart: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"].map((month) => ({
        month,
        theorie: students.length
          ? Math.round(students.reduce((sum, s) => sum + s.theoryProgress, 0) / students.length)
          : 0,
        pratique: students.length
          ? Math.round(students.reduce((sum, s) => sum + s.practiceProgress, 0) / students.length)
          : 0,
      })),
      enrollmentChart: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"].map((month) => ({
        month,
        inscriptions: 0,
      })),
      activity: [...results]
        .sort((a, b) => b.takenAt.localeCompare(a.takenAt))
        .slice(0, 6)
        .map((r) => {
          const student = students.find((s) => s.id === r.studentId);
          return {
            id: r.id,
            at: r.takenAt,
            label: `${student?.firstName ?? "Élève"} ${student?.lastName ?? ""} — examen ${r.passed ? "réussi" : "échoué"}`,
            detail: `Score ${r.score}%`,
          };
        }),
    });
  },

  async instructor(organizationId: string, instructorId: string) {
    const d = store();
    const students = scoped(d.students, organizationId).filter(
      (s) => s.instructorId === instructorId,
    );
    const assignments = scoped(d.assignments, organizationId).filter(
      (a) => a.instructorId === instructorId,
    );
    const subs = scoped(d.submissions, organizationId).filter((s) =>
      assignments.some((a) => a.id === s.assignmentId),
    );
    return delay({
      students: students.length,
      todaySessions: scoped(d.sessions, organizationId).filter(
        (s) => s.instructorId === instructorId && sameDay(s.start),
      ).length,
      assignments: assignments.length,
      exams: scoped(d.exams, organizationId).filter((e) => e.status === "published").length,
      pendingGrading: subs.filter((s) => s.submittedAt && s.score === null).length,
      struggling: students.filter((s) => s.average < 60).slice(0, 5),
    });
  },

  async student(organizationId: string, studentId: string) {
    const d = store();
    const student = scoped(d.students, organizationId).find((s) => s.id === studentId) ?? null;
    const results = scoped(d.examResults, organizationId).filter((r) => r.studentId === studentId);
    const assignments = scoped(d.assignments, organizationId).filter(
      (a) => a.status === "published" && a.targetStudentIds.includes(studentId),
    );
    const subs = scoped(d.submissions, organizationId).filter((s) => s.studentId === studentId);
    return delay({
      student,
      overall: student ? Math.round((student.theoryProgress + student.practiceProgress) / 2) : 0,
      results,
      pendingAssignments: assignments.filter(
        (a) => !subs.find((s) => s.assignmentId === a.id)?.submittedAt,
      ),
      nextSession:
        scoped(d.sessions, organizationId)
          .filter((s) => s.studentId === studentId && new Date(s.start) > new Date())
          .sort((a, b) => a.start.localeCompare(b.start))[0] ?? null,
      upcomingEvents: scoped(d.events, organizationId)
        .filter((e) => new Date(e.start) > new Date())
        .slice(0, 5),
    });
  },
};
