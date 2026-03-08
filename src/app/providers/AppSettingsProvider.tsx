import React, { createContext, useContext, useMemo, useState } from "react";

type AppSettingsContextValue = {
  displayName: string;
  setDisplayName: (name: string) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  celebrationEffectsEnabled: boolean;
  setCelebrationEffectsEnabled: (enabled: boolean) => void;
  backupEnabled: boolean;
  setBackupEnabled: (enabled: boolean) => void;
};

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export const AppSettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [displayName, setDisplayName] = useState("Guest Student");
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [celebrationEffectsEnabled, setCelebrationEffectsEnabled] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(false);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      displayName,
      setDisplayName,
      hapticsEnabled,
      setHapticsEnabled,
      celebrationEffectsEnabled,
      setCelebrationEffectsEnabled,
      backupEnabled,
      setBackupEnabled,
    }),
    [
      displayName,
      hapticsEnabled,
      celebrationEffectsEnabled,
      backupEnabled,
    ],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

export const useAppSettings = (): AppSettingsContextValue => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return context;
};
