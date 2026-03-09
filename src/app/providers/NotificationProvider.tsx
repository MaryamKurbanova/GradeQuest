import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, readJson, writeJson } from "../../utils/storage";

type ReminderStyle = "standard" | "focused";
type NudgeCadence = "daily" | "twiceDaily" | "hourly";

const DEFAULT_SNOOZE_PRESETS_MINUTES = [30, 120];

const normalizeSnoozePresets = (value: number[]): number[] => {
  const normalized = [...new Set(value)]
    .map((item) => Math.round(item))
    .filter((item) => item >= 5 && item <= 720)
    .sort((a, b) => a - b);

  if (normalized.length === 0) {
    return DEFAULT_SNOOZE_PRESETS_MINUTES;
  }
  return normalized;
};

type NotificationContextValue = {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  assignmentRemindersEnabled: boolean;
  setAssignmentRemindersEnabled: (enabled: boolean) => void;
  examRemindersEnabled: boolean;
  setExamRemindersEnabled: (enabled: boolean) => void;
  streakNudgesEnabled: boolean;
  setStreakNudgesEnabled: (enabled: boolean) => void;
  reminderStyle: ReminderStyle;
  setReminderStyle: (style: ReminderStyle) => void;
  persistentRemindersEnabled: boolean;
  setPersistentRemindersEnabled: (enabled: boolean) => void;
  nudgeCadence: NudgeCadence;
  setNudgeCadence: (cadence: NudgeCadence) => void;
  snoozePresetsMinutes: number[];
  setSnoozePresetsMinutes: (minutes: number[]) => void;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

type PersistedNotifications = {
  notificationsEnabled: boolean;
  assignmentRemindersEnabled: boolean;
  examRemindersEnabled: boolean;
  streakNudgesEnabled: boolean;
  reminderStyle: ReminderStyle;
  persistentRemindersEnabled: boolean;
  nudgeCadence: NudgeCadence;
  snoozePresetsMinutes: number[];
  permissionGranted: boolean;
};

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [assignmentRemindersEnabled, setAssignmentRemindersEnabled] = useState(true);
  const [examRemindersEnabled, setExamRemindersEnabled] = useState(true);
  const [streakNudgesEnabled, setStreakNudgesEnabled] = useState(true);
  const [reminderStyle, setReminderStyle] = useState<ReminderStyle>("standard");
  const [persistentRemindersEnabled, setPersistentRemindersEnabled] = useState(false);
  const [nudgeCadence, setNudgeCadence] = useState<NudgeCadence>("daily");
  const [snoozePresetsMinutes, setSnoozePresetsMinutesState] = useState<number[]>(
    DEFAULT_SNOOZE_PRESETS_MINUTES,
  );
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const persisted = await readJson<PersistedNotifications | null>(
        STORAGE_KEYS.notifications,
        null,
      );
      if (persisted && isMounted) {
        setNotificationsEnabled(Boolean(persisted.notificationsEnabled));
        setAssignmentRemindersEnabled(Boolean(persisted.assignmentRemindersEnabled));
        setExamRemindersEnabled(Boolean(persisted.examRemindersEnabled));
        setStreakNudgesEnabled(Boolean(persisted.streakNudgesEnabled));
        setReminderStyle(persisted.reminderStyle ?? "standard");
        setPersistentRemindersEnabled(Boolean(persisted.persistentRemindersEnabled));
        setNudgeCadence(persisted.nudgeCadence ?? "daily");
        setSnoozePresetsMinutesState(
          normalizeSnoozePresets(persisted.snoozePresetsMinutes ?? DEFAULT_SNOOZE_PRESETS_MINUTES),
        );
        setPermissionGranted(Boolean(persisted.permissionGranted));
      }
      if (isMounted) {
        setIsHydrated(true);
      }
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

    void writeJson<PersistedNotifications>(STORAGE_KEYS.notifications, {
      notificationsEnabled,
      assignmentRemindersEnabled,
      examRemindersEnabled,
      streakNudgesEnabled,
      reminderStyle,
      persistentRemindersEnabled,
      nudgeCadence,
      snoozePresetsMinutes,
      permissionGranted,
    });
  }, [
    notificationsEnabled,
    assignmentRemindersEnabled,
    examRemindersEnabled,
    streakNudgesEnabled,
    reminderStyle,
    persistentRemindersEnabled,
    nudgeCadence,
    snoozePresetsMinutes,
    permissionGranted,
    isHydrated,
  ]);

  const requestPermission = async () => {
    // Placeholder for native permission request.
    setPermissionGranted(true);
    return true;
  };

  const setSnoozePresetsMinutes = useCallback((minutes: number[]) => {
    setSnoozePresetsMinutesState(normalizeSnoozePresets(minutes));
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notificationsEnabled,
      setNotificationsEnabled,
      assignmentRemindersEnabled,
      setAssignmentRemindersEnabled,
      examRemindersEnabled,
      setExamRemindersEnabled,
      streakNudgesEnabled,
      setStreakNudgesEnabled,
      reminderStyle,
      setReminderStyle,
      persistentRemindersEnabled,
      setPersistentRemindersEnabled,
      nudgeCadence,
      setNudgeCadence,
      snoozePresetsMinutes,
      setSnoozePresetsMinutes,
      permissionGranted,
      requestPermission,
    }),
    [
      notificationsEnabled,
      assignmentRemindersEnabled,
      examRemindersEnabled,
      streakNudgesEnabled,
      reminderStyle,
      persistentRemindersEnabled,
      nudgeCadence,
      snoozePresetsMinutes,
      permissionGranted,
      setSnoozePresetsMinutes,
    ],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};
