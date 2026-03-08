export type RouteKey =
  | "dashboard"
  | "assignments"
  | "assignmentForm"
  | "exams"
  | "examForm"
  | "calendar"
  | "gamification"
  | "calculator"
  | "paywall"
  | "analytics"
  | "themes"
  | "settings"
  | "firstLaunch";

export type RouteItem = {
  key: RouteKey;
  label: string;
};
