type ExpoNotificationsModule = {
  requestPermissionsAsync?: () => Promise<{
    granted?: boolean;
    status?: "granted" | "denied" | "undetermined";
  }>;
  getPermissionsAsync?: () => Promise<{
    granted?: boolean;
    status?: "granted" | "denied" | "undetermined";
  }>;
};

const loadExpoNotifications = (): ExpoNotificationsModule | null => {
  const maybeRequire = (globalThis as { require?: (name: string) => unknown }).require;
  if (!maybeRequire) {
    return null;
  }

  try {
    return maybeRequire("expo-notifications") as ExpoNotificationsModule;
  } catch {
    return null;
  }
};

const isGranted = (payload: { granted?: boolean; status?: string } | null | undefined): boolean => {
  if (!payload) {
    return true;
  }
  if (payload.granted === true) {
    return true;
  }
  return payload.status === "granted";
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const expoNotifications = loadExpoNotifications();
  if (!expoNotifications?.requestPermissionsAsync) {
    return true;
  }

  try {
    const result = await expoNotifications.requestPermissionsAsync();
    return isGranted(result);
  } catch {
    return false;
  }
};

export const getNotificationPermissionStatus = async (): Promise<boolean> => {
  const expoNotifications = loadExpoNotifications();
  if (!expoNotifications?.getPermissionsAsync) {
    return true;
  }

  try {
    const result = await expoNotifications.getPermissionsAsync();
    return isGranted(result);
  } catch {
    return false;
  }
};
