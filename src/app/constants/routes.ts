import type { RouteItem, RouteKey } from "../navigation/types";

export const APP_ROUTES: RouteItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "assignments", label: "Assignments" },
  { key: "assignmentForm", label: "Add Assignment" },
  { key: "exams", label: "Exams" },
  { key: "examForm", label: "Add Exam" },
  { key: "calendar", label: "Calendar" },
  { key: "gamification", label: "Gamification" },
  { key: "calculator", label: "Calculator" },
  { key: "paywall", label: "Premium" },
  { key: "analytics", label: "Analytics" },
  { key: "widgets", label: "Widgets" },
  { key: "themes", label: "Themes" },
  { key: "settings", label: "Settings" },
  { key: "firstLaunch", label: "First Launch" },
];

export const DEFAULT_ROUTE: RouteKey = "dashboard";
