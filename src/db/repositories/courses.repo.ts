import type { Course } from "../../types/entities";

const nowIso = () => new Date().toISOString();

let courseStore: Course[] = [
  {
    id: "course-algebra-ii",
    name: "Algebra II",
    colorHex: "#6366F1",
    icon: "calculator",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "course-biology",
    name: "Biology",
    colorHex: "#22C55E",
    icon: "flask",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "course-english",
    name: "English",
    colorHex: "#0EA5E9",
    icon: "book",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "course-world-history",
    name: "World History",
    colorHex: "#F97316",
    icon: "globe",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "course-chemistry",
    name: "Chemistry",
    colorHex: "#8B5CF6",
    icon: "flask",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const listCourses = (): Course[] => {
  return [...courseStore];
};

export const replaceCourseStore = (nextCourses: Course[]): void => {
  courseStore = [...nextCourses];
};

export const findCourseById = (courseId: string): Course | undefined => {
  return courseStore.find((course) => course.id === courseId);
};

export const findCourseByName = (courseName: string): Course | undefined => {
  return courseStore.find((course) => course.name === courseName);
};

export const createCourse = (input: Pick<Course, "name" | "colorHex" | "icon">): Course => {
  const timestamp = nowIso();
  const newCourse: Course = {
    id: `course-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: input.name,
    colorHex: input.colorHex,
    icon: input.icon,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  courseStore = [newCourse, ...courseStore];
  return newCourse;
};
