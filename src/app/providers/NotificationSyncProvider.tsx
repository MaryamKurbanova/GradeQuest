import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  clearReminderSchedule,
  getReminderScheduleSnapshot,
  syncReminderSchedule,
  type ReminderScheduleSnapshot,
} from "../services/notifications/NotificationScheduler";
import type { ReminderPreferences } from "../services/notifications/ReminderFactory";
import { useGamification } from "./GamificationProvider";
import { useNotifications } from "./NotificationProvider";
import { useStudyData } from "./StudyDataProvider";

type NotificationSyncContextValue = {
  schedule: ReminderScheduleSnapshot;
  isSyncing: boolean;
  syncNow: () => Promise<void>;
};

const defaultSchedule: ReminderScheduleSnapshot = {
  reminders: [],
  scheduledCount: 0,
  nextReminderAt: null,
  lastSyncedAt: null,
};

const NotificationSyncContext = createContext<NotificationSyncContextValue | undefined>(undefined);

export const NotificationSyncProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { assignments, exams } = useStudyData();
  const { streakDays } = useGamification();
  const {
    notificationsEnabled,
    assignmentRemindersEnabled,
    examRemindersEnabled,
    streakNudgesEnabled,
    reminderStyle,
    persistentRemindersEnabled,
    nudgeCadence,
    snoozePresetsMinutes,
    permissionGranted,
  } = useNotifications();

  const [schedule, setSchedule] = useState<ReminderScheduleSnapshot>(defaultSchedule);
  const [isSyncing, setIsSyncing] = useState(false);

  const preferences = useMemo<ReminderPreferences>(
    () => ({
      notificationsEnabled: notificationsEnabled && permissionGranted,
      assignmentRemindersEnabled,
      examRemindersEnabled,
      streakNudgesEnabled,
      reminderStyle,
      persistentRemindersEnabled,
      nudgeCadence,
      snoozePresetsMinutes,
    }),
    [
      notificationsEnabled,
      permissionGranted,
      assignmentRemindersEnabled,
      examRemindersEnabled,
      streakNudgesEnabled,
      reminderStyle,
      persistentRemindersEnabled,
      nudgeCadence,
      snoozePresetsMinutes,
    ],
  );

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      if (!preferences.notificationsEnabled) {
        const cleared = await clearReminderSchedule();
        setSchedule(cleared);
        return;
      }

      const nextSchedule = await syncReminderSchedule({
        assignments,
        exams,
        streakDays,
        preferences,
      });
      setSchedule(nextSchedule);
    } finally {
      setIsSyncing(false);
    }
  }, [assignments, exams, preferences, streakDays]);

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      const snapshot = await getReminderScheduleSnapshot();
      if (isMounted) {
        setSchedule(snapshot);
      }
    };
    void hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    void syncNow();
  }, [syncNow]);

  const value = useMemo<NotificationSyncContextValue>(
    () => ({
      schedule,
      isSyncing,
      syncNow,
    }),
    [isSyncing, schedule, syncNow],
  );

  return (
    <NotificationSyncContext.Provider value={value}>{children}</NotificationSyncContext.Provider>
  );
};

export const useNotificationSync = (): NotificationSyncContextValue => {
  const context = useContext(NotificationSyncContext);
  if (!context) {
    throw new Error("useNotificationSync must be used within NotificationSyncProvider");
  }
  return context;
};
