import type { Assignment, Priority } from "../../types/entities";

type CreateAssignmentInput = {
  courseId: string;
  title: string;
  notes: string | null;
  dueAt: string;
  priority: Priority;
};

const nowIso = () => new Date().toISOString();

let assignmentStore: Assignment[] = [];

export const listAssignments = (): Assignment[] => {
  return [...assignmentStore].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
};

export const replaceAssignmentStore = (nextAssignments: Assignment[]): void => {
  assignmentStore = [...nextAssignments];
};

export const createAssignment = (input: CreateAssignmentInput): Assignment => {
  const timestamp = nowIso();
  const next: Assignment = {
    id: `assignment-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    courseId: input.courseId,
    title: input.title,
    notes: input.notes,
    dueAt: input.dueAt,
    priority: input.priority,
    status: "pending",
    completedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  assignmentStore = [next, ...assignmentStore];
  return next;
};

export const toggleAssignmentCompletion = (assignmentId: string): Assignment | null => {
  let updated: Assignment | null = null;

  assignmentStore = assignmentStore.map((assignment) => {
    if (assignment.id !== assignmentId) {
      return assignment;
    }

    const isCompleted = assignment.status === "completed";
    updated = {
      ...assignment,
      status: isCompleted ? "pending" : "completed",
      completedAt: isCompleted ? null : nowIso(),
      updatedAt: nowIso(),
    };
    return updated;
  });

  return updated;
};

export const deleteAssignment = (assignmentId: string): boolean => {
  const nextAssignments = assignmentStore.filter((assignment) => assignment.id !== assignmentId);
  const wasDeleted = nextAssignments.length !== assignmentStore.length;
  assignmentStore = nextAssignments;
  return wasDeleted;
};
