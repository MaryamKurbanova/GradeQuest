import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  createAssignment as createAssignmentRecord,
  deleteAssignment as deleteAssignmentRecord,
  listAssignments,
  replaceAssignmentStore,
  toggleAssignmentCompletion as toggleAssignmentCompletionRecord,
} from "../../db/repositories/assignments.repo";
import {
  applyCourseStyleDefaults as applyCourseStyleDefaultsRecord,
  createCourse as createCourseRecord,
  deleteCourse as deleteCourseRecord,
  findCourseByName,
  listCourses,
  replaceCourseStore,
  updateCourse as updateCourseRecord,
} from "../../db/repositories/courses.repo";
import {
  createExam as createExamRecord,
  deleteExam as deleteExamRecord,
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

type CreateCourseInput = {
  name: string;
  colorHex: string;
  icon: string;
};

type UpdateCourseInput = Partial<CreateCourseInput>;

type StudyDataContextValue = {
  isHydrated: boolean;
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  applyCourseStyleDefaults: (input: { colorHex: string; icon: string }) => void;
  createCourse: (input: CreateCourseInput) => Course;
  updateCourse: (courseId: string, input: UpdateCourseInput) => Course;
  deleteCourse: (courseId: string) => void;
  createAssignment: (input: CreateAssignmentInput) => Assignment;
  toggleAssignmentCompletion: (assignmentId: string) => void;
  deleteAssignment: (assignmentId: string) => void;
  createExam: (input: CreateExamInput) => Exam;
  toggleExamCompletion: (examId: string) => void;
  deleteExam: (examId: string) => void;
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

  const createCourse = useCallback((input: CreateCourseInput): Course => {
    const normalizedName = input.name.trim();
    if (!normalizedName) {
      throw new Error("Course name is required.");
    }

    const duplicate = listCourses().find(
      (course) => course.name.toLowerCase() === normalizedName.toLowerCase(),
    );
    if (duplicate) {
      throw new Error("A course with this name already exists.");
    }

    const created = createCourseRecord({
      name: normalizedName,
      colorHex: input.colorHex.trim() || "#6366F1",
      icon: input.icon.trim() || "book",
    });
    setCourses(listCourses());
    return created;
  }, []);

  const updateCourse = useCallback((courseId: string, input: UpdateCourseInput): Course => {
    const current = listCourses().find((course) => course.id === courseId);
    if (!current) {
      throw new Error("Course not found.");
    }

    const normalizedName = input.name?.trim();
    if (normalizedName !== undefined && normalizedName.length === 0) {
      throw new Error("Course name is required.");
    }

    const nextName = normalizedName ?? current.name;
    const duplicate = listCourses().find(
      (course) =>
        course.id !== courseId && course.name.toLowerCase() === nextName.toLowerCase(),
    );
    if (duplicate) {
      throw new Error("Another course with this name already exists.");
    }

    const updated = updateCourseRecord(courseId, {
      name: nextName,
      colorHex: input.colorHex?.trim() || current.colorHex,
      icon: input.icon?.trim() || current.icon,
    });

    if (!updated) {
      throw new Error("Course not found.");
    }

    setCourses(listCourses());
    return updated;
  }, []);

  const deleteCourse = useCallback(
    (courseId: string) => {
      const assignmentLinked = assignments.some((assignment) => assignment.courseId === courseId);
      const examLinked = exams.some((exam) => exam.courseId === courseId);
      if (assignmentLinked || examLinked) {
        throw new Error("This course has assignments or exams. Remove those first.");
      }

      const deleted = deleteCourseRecord(courseId);
      if (!deleted) {
        throw new Error("Course not found.");
      }
      setCourses(listCourses());
    },
    [assignments, exams],
  );

  const applyCourseStyleDefaults = useCallback((input: { colorHex: string; icon: string }) => {
    applyCourseStyleDefaultsRecord({
      colorHex: input.colorHex,
      icon: input.icon,
    });
    setCourses(listCourses());
  }, []);

  const toggleAssignmentCompletion = (assignmentId: string) => {
    toggleAssignmentCompletionRecord(assignmentId);
    setAssignments(listAssignments());
  };

  const deleteAssignment = useCallback((assignmentId: string) => {
    const deleted = deleteAssignmentRecord(assignmentId);
    if (!deleted) {
      throw new Error("Assignment not found.");
    }
    setAssignments(listAssignments());
  }, []);

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

  const deleteExam = useCallback((examId: string) => {
    const deleted = deleteExamRecord(examId);
    if (!deleted) {
      throw new Error("Exam not found.");
    }
    setExams(listExams());
  }, []);

  const value = useMemo<StudyDataContextValue>(
    () => ({
      isHydrated,
      courses,
      assignments,
      exams,
      applyCourseStyleDefaults,
      createCourse,
      updateCourse,
      deleteCourse,
      createAssignment,
      toggleAssignmentCompletion,
      deleteAssignment,
      createExam,
      toggleExamCompletion,
      deleteExam,
    }),
    [
      isHydrated,
      courses,
      assignments,
      exams,
      applyCourseStyleDefaults,
      createCourse,
      updateCourse,
      deleteCourse,
      deleteAssignment,
      deleteExam,
    ],
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
