export type EntityId = string;

export type AssignmentStatus = "pending" | "completed";
export type ExamStatus = "upcoming" | "completed";
export type Priority = "low" | "medium" | "high";
export type SubscriptionPlan = "free" | "monthly" | "yearly";

export type Profile = {
  id: EntityId;
  displayName: string;
  createdAt: string;
  lastOpenedAt: string;
};

export type Course = {
  id: EntityId;
  name: string;
  colorHex: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
};

export type Assignment = {
  id: EntityId;
  courseId: EntityId;
  title: string;
  notes: string | null;
  dueAt: string;
  priority: Priority;
  status: AssignmentStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Exam = {
  id: EntityId;
  courseId: EntityId;
  title: string;
  examAt: string;
  weightPercent: number;
  notes: string | null;
  status: ExamStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AppSettings = {
  id: EntityId;
  displayName: string;
  backupEnabled: boolean;
  hapticsEnabled: boolean;
  celebrationEffectsEnabled: boolean;
  activeTheme: string;
  updatedAt: string;
};

export type NotificationPrefs = {
  id: EntityId;
  notificationsEnabled: boolean;
  assignmentRemindersEnabled: boolean;
  examRemindersEnabled: boolean;
  streakNudgesEnabled: boolean;
  reminderStyle: "standard" | "focused";
  persistentRemindersEnabled: boolean;
  nudgeCadence: "daily" | "twiceDaily" | "hourly";
  snoozePresetsMinutes: number[];
  permissionGranted: boolean;
  updatedAt: string;
};

export type SubscriptionState = {
  id: EntityId;
  isPremium: boolean;
  plan: SubscriptionPlan;
  productId: string | null;
  expiresAt: string | null;
  lastVerifiedAt: string | null;
  updatedAt: string;
};

export type GamificationState = {
  id: EntityId;
  pointsTotal: number;
  currentLevel: number;
  streakDays: number;
  lastCompletionDate: string | null;
  updatedAt: string;
};

export type PointsLog = {
  id: EntityId;
  source: string;
  sourceId: EntityId | null;
  pointsDelta: number;
  createdAt: string;
};

export type Badge = {
  id: EntityId;
  key: string;
  name: string;
  description: string;
  isPremiumBadge: boolean;
};

export type UserBadge = {
  id: EntityId;
  badgeId: EntityId;
  unlockedAt: string;
};

export type CalculatorUsage = {
  id: EntityId;
  monthKey: string;
  count: number;
  updatedAt: string;
};

export type CalculatorHistoryEntry = {
  id: EntityId;
  currentGrade: number;
  examWeight: number;
  targetGrade: number;
  requiredScore: number;
  createdAt: string;
};
