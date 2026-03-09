import type { RouteItem, RouteKey } from "../navigation/types";

export const APP_ROUTES: RouteItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "assignments", label: "Assignments" },
  { key: "assignmentForm", label: "Add Assignment" },
  { key: "exams", label: "Exams" },
  { key: "examForm", label: "Add Exam" },
  { key: "courses", label: "Courses" },
  { key: "courseForm", label: "Add Course" },
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

export const PRIMARY_NAV_ROUTES: RouteItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "assignments", label: "Assignments" },
  { key: "exams", label: "Exams" },
  { key: "calendar", label: "Calendar" },
  { key: "calculator", label: "Calculator" },
  { key: "settings", label: "Settings" },
];

const ROUTE_LABELS: Record<RouteKey, string> = APP_ROUTES.reduce(
  (acc, route) => ({
    ...acc,
    [route.key]: route.label,
  }),
  {} as Record<RouteKey, string>,
);

export const getRouteLabel = (routeKey: RouteKey): string => {
  return ROUTE_LABELS[routeKey] ?? "Dashboard";
};

export const DEFAULT_ROUTE: RouteKey = "dashboard";
