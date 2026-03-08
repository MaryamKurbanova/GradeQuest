import React, { createContext, useContext, useMemo, useState } from "react";

type ReminderStyle = "standard" | "focused";

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
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [assignmentRemindersEnabled, setAssignmentRemindersEnabled] = useState(true);
  const [examRemindersEnabled, setExamRemindersEnabled] = useState(true);
  const [streakNudgesEnabled, setStreakNudgesEnabled] = useState(true);
  const [reminderStyle, setReminderStyle] = useState<ReminderStyle>("standard");
  const [permissionGranted, setPermissionGranted] = useState(true);

  const requestPermission = async () => {
    // Placeholder for native permission request.
    setPermissionGranted(true);
    return true;
  };

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
      permissionGranted,
      requestPermission,
    }),
    [
      notificationsEnabled,
      assignmentRemindersEnabled,
      examRemindersEnabled,
      streakNudgesEnabled,
      reminderStyle,
      permissionGranted,
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
