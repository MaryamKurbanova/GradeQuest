import type { Exam } from "../../types/entities";

type CreateExamInput = {
  courseId: string;
  title: string;
  examAt: string;
  weightPercent: number;
  notes: string | null;
};

const nowIso = () => new Date().toISOString();

let examStore: Exam[] = [];

export const listExams = (): Exam[] => {
  return [...examStore].sort((a, b) => a.examAt.localeCompare(b.examAt));
};

export const replaceExamStore = (nextExams: Exam[]): void => {
  examStore = [...nextExams];
};

export const createExam = (input: CreateExamInput): Exam => {
  const timestamp = nowIso();
  const next: Exam = {
    id: `exam-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    courseId: input.courseId,
    title: input.title,
    examAt: input.examAt,
    weightPercent: input.weightPercent,
    notes: input.notes,
    status: "upcoming",
    completedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  examStore = [next, ...examStore];
  return next;
};

export const toggleExamCompletion = (examId: string): Exam | null => {
  let updated: Exam | null = null;

  examStore = examStore.map((exam) => {
    if (exam.id !== examId) {
      return exam;
    }

    const isCompleted = exam.status === "completed";
    updated = {
      ...exam,
      status: isCompleted ? "upcoming" : "completed",
      completedAt: isCompleted ? null : nowIso(),
      updatedAt: nowIso(),
    };
    return updated;
  });

  return updated;
};

export const deleteExam = (examId: string): boolean => {
  const nextExams = examStore.filter((exam) => exam.id !== examId);
  const wasDeleted = nextExams.length !== examStore.length;
  examStore = nextExams;
  return wasDeleted;
};
