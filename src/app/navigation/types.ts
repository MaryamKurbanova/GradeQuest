export type RouteKey =
  | "dashboard"
  | "assignments"
  | "assignmentForm"
  | "exams"
  | "examForm"
  | "courses"
  | "courseForm"
  | "calendar"
  | "gamification"
  | "calculator"
  | "paywall"
  | "analytics"
  | "widgets"
  | "themes"
  | "settings"
  | "firstLaunch";

export type RouteItem = {
  key: RouteKey;
  label: string;
};
