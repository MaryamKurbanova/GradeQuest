import type { Assignment, Exam } from "../../../types/entities";
import { parseAppDateTime } from "../../../utils/date";

export type ReminderKind = "assignmentDue" | "examDue" | "streakNudge";
export type ReminderStyle = "standard" | "focused";
export type NudgeCadence = "daily" | "twiceDaily" | "hourly";

export type ReminderPreferences = {
  notificationsEnabled: boolean;
  assignmentRemindersEnabled: boolean;
  examRemindersEnabled: boolean;
  streakNudgesEnabled: boolean;
  reminderStyle: ReminderStyle;
  persistentRemindersEnabled: boolean;
  nudgeCadence: NudgeCadence;
  snoozePresetsMinutes: number[];
};

export type ScheduledReminder = {
  id: string;
  kind: ReminderKind;
  sourceId: string;
  title: string;
  body: string;
  fireAt: string;
  persistent: boolean;
  snoozePresetsMinutes: number[];
};

export type BuildReminderPlanInput = {
  assignments: Assignment[];
  exams: Exam[];
  streakDays: number;
  preferences: ReminderPreferences;
  now?: Date;
};

const MINIMUM_DELAY_MS = 5 * 60 * 1000;

const toFutureOrMinimumDelay = (target: Date, now: Date): Date => {
  if (target.getTime() > now.getTime()) {
    return target;
  }
  return new Date(now.getTime() + MINIMUM_DELAY_MS);
};

const withOffsetMinutes = (base: Date, minutes: number): Date => {
  return new Date(base.getTime() + minutes * 60 * 1000);
};

const buildAssignmentReminders = (
  assignments: Assignment[],
  now: Date,
  preferences: ReminderPreferences,
): ScheduledReminder[] => {
  if (!preferences.assignmentRemindersEnabled) {
    return [];
  }

  const reminders: ScheduledReminder[] = [];
  assignments
    .filter((assignment) => assignment.status === "pending")
    .forEach((assignment) => {
      const dueAt = parseAppDateTime(assignment.dueAt);
      if (!dueAt) {
        return;
      }
      if (dueAt.getTime() <= now.getTime()) {
        return;
      }

      const leadMinutes = preferences.reminderStyle === "focused" ? -180 : -120;
      const fireAt = toFutureOrMinimumDelay(withOffsetMinutes(dueAt, leadMinutes), now);
      reminders.push({
        id: `assignment:${assignment.id}`,
        kind: "assignmentDue",
        sourceId: assignment.id,
        title: assignment.title,
        body: preferences.persistentRemindersEnabled
          ? "Assignment reminder: keep going until this is done."
          : "Assignment reminder: due soon.",
        fireAt: fireAt.toISOString(),
        persistent: preferences.persistentRemindersEnabled,
        snoozePresetsMinutes: preferences.snoozePresetsMinutes,
      });
    });

  return reminders;
};

const buildExamReminders = (
  exams: Exam[],
  now: Date,
  preferences: ReminderPreferences,
): ScheduledReminder[] => {
  if (!preferences.examRemindersEnabled) {
    return [];
  }

  const reminders: ScheduledReminder[] = [];
  exams
    .filter((exam) => exam.status === "upcoming")
    .forEach((exam) => {
      const examAt = parseAppDateTime(exam.examAt);
      if (!examAt) {
        return;
      }
      if (examAt.getTime() <= now.getTime()) {
        return;
      }

      const leadHours = preferences.reminderStyle === "focused" ? -36 : -24;
      const fireAt = toFutureOrMinimumDelay(withOffsetMinutes(examAt, leadHours * 60), now);
      reminders.push({
        id: `exam:${exam.id}`,
        kind: "examDue",
        sourceId: exam.id,
        title: exam.title,
        body: preferences.persistentRemindersEnabled
          ? "Exam reminder: stay focused until you complete your prep."
          : "Exam reminder: upcoming exam.",
        fireAt: fireAt.toISOString(),
        persistent: preferences.persistentRemindersEnabled,
        snoozePresetsMinutes: preferences.snoozePresetsMinutes,
      });
    });

  return reminders;
};

const buildStreakNudgeReminders = (
  streakDays: number,
  now: Date,
  preferences: ReminderPreferences,
): ScheduledReminder[] => {
  if (!preferences.streakNudgesEnabled) {
    return [];
  }

  if (preferences.nudgeCadence === "hourly") {
    return Array.from({ length: 4 }).map((_, index) => {
      const fireAt = new Date(now.getTime() + (index + 1) * 60 * 60 * 1000);
      return {
        id: `streak:hourly:${index + 1}`,
        kind: "streakNudge" as const,
        sourceId: "streak",
        title: "Keep your streak alive",
        body: `You are on a ${streakDays}-day streak. Complete one task to protect it.`,
        fireAt: fireAt.toISOString(),
        persistent: preferences.persistentRemindersEnabled,
        snoozePresetsMinutes: preferences.snoozePresetsMinutes,
      };
    });
  }

  const targetHours = preferences.nudgeCadence === "twiceDaily" ? [13, 19] : [19];
  return targetHours.map((hour, index) => {
    const fireAt = new Date(now);
    fireAt.setHours(hour, 0, 0, 0);
    if (fireAt.getTime() <= now.getTime()) {
      fireAt.setDate(fireAt.getDate() + 1);
    }
    return {
      id: `streak:${preferences.nudgeCadence}:${index + 1}`,
      kind: "streakNudge" as const,
      sourceId: "streak",
      title: "Stay consistent",
      body: `Current streak: ${streakDays} day${streakDays === 1 ? "" : "s"}.`,
      fireAt: fireAt.toISOString(),
      persistent: preferences.persistentRemindersEnabled,
      snoozePresetsMinutes: preferences.snoozePresetsMinutes,
    };
  });
};

export const buildReminderPlan = (input: BuildReminderPlanInput): ScheduledReminder[] => {
  const now = input.now ?? new Date();
  const preferences = input.preferences;
  if (!preferences.notificationsEnabled) {
    return [];
  }

  const plan = [
    ...buildAssignmentReminders(input.assignments, now, preferences),
    ...buildExamReminders(input.exams, now, preferences),
    ...buildStreakNudgeReminders(input.streakDays, now, preferences),
  ];

  return [...plan].sort((a, b) => a.fireAt.localeCompare(b.fireAt));
};
