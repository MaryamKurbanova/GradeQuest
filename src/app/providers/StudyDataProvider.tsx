import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  createAssignment as createAssignmentRecord,
  listAssignments,
  replaceAssignmentStore,
  toggleAssignmentCompletion as toggleAssignmentCompletionRecord,
} from "../../db/repositories/assignments.repo";
import {
  findCourseByName,
  listCourses,
  replaceCourseStore,
} from "../../db/repositories/courses.repo";
import {
  createExam as createExamRecord,
  listExams,
  replaceExamStore,
  toggleExamCompletion as toggleExamCompletionRecord,
} from "../../db/repositories/exams.repo";
import type { Assignment, Course, Exam, Priority } from "../../types/entities";
import { STORAGE_KEYS, readJson, writeJson } from "../../utils/storage";

type CreateAssignmentInput = {
  title: string;
  courseName: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  notes: string | null;
};

type CreateExamInput = {
  title: string;
  courseName: string;
  examDate: string;
  examTime: string;
  weightPercent: number;
  notes: string | null;
};

type StudyDataContextValue = {
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  createAssignment: (input: CreateAssignmentInput) => Assignment;
  toggleAssignmentCompletion: (assignmentId: string) => void;
  createExam: (input: CreateExamInput) => Exam;
  toggleExamCompletion: (examId: string) => void;
};

const StudyDataContext = createContext<StudyDataContextValue | undefined>(undefined);

type PersistedStudyData = {
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
};

const combineDateTime = (datePart: string, timePart: string): string => {
  return `${datePart.trim()} ${timePart.trim()}`.trim();
};

export const StudyDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => listCourses());
  const [assignments, setAssignments] = useState<Assignment[]>(() => listAssignments());
  const [exams, setExams] = useState<Exam[]>(() => listExams());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const persisted = await readJson<PersistedStudyData | null>(
        STORAGE_KEYS.studyData,
        null,
      );
      if (!persisted || !isMounted) {
        if (isMounted) {
          setIsHydrated(true);
        }
        return;
      }

      const nextCourses =
        Array.isArray(persisted.courses) && persisted.courses.length > 0
          ? persisted.courses
          : listCourses();
      const nextAssignments = Array.isArray(persisted.assignments)
        ? persisted.assignments
        : [];
      const nextExams = Array.isArray(persisted.exams) ? persisted.exams : [];

      replaceCourseStore(nextCourses);
      replaceAssignmentStore(nextAssignments);
      replaceExamStore(nextExams);

      setCourses(listCourses());
      setAssignments(listAssignments());
      setExams(listExams());
      setIsHydrated(true);
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void writeJson<PersistedStudyData>(STORAGE_KEYS.studyData, {
      courses,
      assignments,
      exams,
    });
  }, [courses, assignments, exams, isHydrated]);

  const createAssignment = (input: CreateAssignmentInput): Assignment => {
    const course = findCourseByName(input.courseName);
    if (!course) {
      throw new Error(`Course not found: ${input.courseName}`);
    }

    const created = createAssignmentRecord({
      courseId: course.id,
      title: input.title.trim(),
      notes: input.notes?.trim() || null,
      dueAt: combineDateTime(input.dueDate, input.dueTime),
      priority: input.priority,
    });

    setAssignments(listAssignments());
    return created;
  };

  const toggleAssignmentCompletion = (assignmentId: string) => {
    toggleAssignmentCompletionRecord(assignmentId);
    setAssignments(listAssignments());
  };

  const createExam = (input: CreateExamInput): Exam => {
    const course = findCourseByName(input.courseName);
    if (!course) {
      throw new Error(`Course not found: ${input.courseName}`);
    }

    const created = createExamRecord({
      courseId: course.id,
      title: input.title.trim(),
      examAt: combineDateTime(input.examDate, input.examTime),
      weightPercent: input.weightPercent,
      notes: input.notes?.trim() || null,
    });

    setExams(listExams());
    return created;
  };

  const toggleExamCompletion = (examId: string) => {
    toggleExamCompletionRecord(examId);
    setExams(listExams());
  };

  const value = useMemo<StudyDataContextValue>(
    () => ({
      courses,
      assignments,
      exams,
      createAssignment,
      toggleAssignmentCompletion,
      createExam,
      toggleExamCompletion,
    }),
    [courses, assignments, exams],
  );

  return <StudyDataContext.Provider value={value}>{children}</StudyDataContext.Provider>;
};

export const useStudyData = (): StudyDataContextValue => {
  const context = useContext(StudyDataContext);
  if (!context) {
    throw new Error("useStudyData must be used within StudyDataProvider");
  }
  return context;
};
