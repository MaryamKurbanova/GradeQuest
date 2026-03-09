import { STORAGE_KEYS, readJson, writeJson } from "../../../utils/storage";
import {
  buildReminderPlan,
  type ReminderPreferences,
  type ScheduledReminder,
} from "./ReminderFactory";
import type { Assignment, Exam } from "../../../types/entities";

type PersistedReminderSchedule = {
  reminders: ScheduledReminder[];
  lastSyncedAt: string | null;
};

export type ReminderScheduleSnapshot = {
  reminders: ScheduledReminder[];
  scheduledCount: number;
  nextReminderAt: string | null;
  lastSyncedAt: string | null;
};

type SyncReminderScheduleInput = {
  assignments: Assignment[];
  exams: Exam[];
  streakDays: number;
  preferences: ReminderPreferences;
};

const toSnapshot = (persisted: PersistedReminderSchedule): ReminderScheduleSnapshot => ({
  reminders: persisted.reminders,
  scheduledCount: persisted.reminders.length,
  nextReminderAt: persisted.reminders[0]?.fireAt ?? null,
  lastSyncedAt: persisted.lastSyncedAt,
});

const defaultPersistedSchedule: PersistedReminderSchedule = {
  reminders: [],
  lastSyncedAt: null,
};

export const getReminderScheduleSnapshot = async (): Promise<ReminderScheduleSnapshot> => {
  const persisted = await readJson<PersistedReminderSchedule>(
    STORAGE_KEYS.reminderSchedule,
    defaultPersistedSchedule,
  );
  return toSnapshot({
    reminders: Array.isArray(persisted.reminders) ? persisted.reminders : [],
    lastSyncedAt: persisted.lastSyncedAt ?? null,
  });
};

export const clearReminderSchedule = async (): Promise<ReminderScheduleSnapshot> => {
  const nextPersisted: PersistedReminderSchedule = {
    reminders: [],
    lastSyncedAt: new Date().toISOString(),
  };
  await writeJson(STORAGE_KEYS.reminderSchedule, nextPersisted);
  return toSnapshot(nextPersisted);
};

export const syncReminderSchedule = async (
  input: SyncReminderScheduleInput,
): Promise<ReminderScheduleSnapshot> => {
  const reminders = buildReminderPlan({
    assignments: input.assignments,
    exams: input.exams,
    streakDays: input.streakDays,
    preferences: input.preferences,
  });

  const nextPersisted: PersistedReminderSchedule = {
    reminders,
    lastSyncedAt: new Date().toISOString(),
  };
  await writeJson(STORAGE_KEYS.reminderSchedule, nextPersisted);
  return toSnapshot(nextPersisted);
};
