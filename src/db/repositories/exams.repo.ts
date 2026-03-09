import type { Exam } from "../../types/entities";

type CreateExamInput = {
  courseId: string;
  title: string;
  examAt: string;
  weightPercent: number;
  notes: string | null;
};

const nowIso = () => new Date().toISOString();

let examStore: Exam[] = [
  {
    id: "exam-1",
    courseId: "course-algebra-ii",
    title: "Calculus Quiz 3",
    examAt: "2026-03-10 10:00",
    weightPercent: 15,
    notes: null,
    status: "upcoming",
    completedAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "exam-2",
    courseId: "course-chemistry",
    title: "Chemistry Unit Test",
    examAt: "2026-03-12 13:30",
    weightPercent: 25,
    notes: null,
    status: "upcoming",
    completedAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "exam-3",
    courseId: "course-world-history",
    title: "History Midterm",
    examAt: "2026-03-16 09:00",
    weightPercent: 30,
    notes: null,
    status: "upcoming",
    completedAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "exam-4",
    courseId: "course-biology",
    title: "Biology Pop Quiz",
    examAt: "2026-03-07 14:00",
    weightPercent: 10,
    notes: null,
    status: "completed",
    completedAt: nowIso(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

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
