import React, { createContext, useContext, useMemo, useState } from "react";

type NotificationContextValue = {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
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
      permissionGranted,
      requestPermission,
    }),
    [notificationsEnabled, permissionGranted],
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
