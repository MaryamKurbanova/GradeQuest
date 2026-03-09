import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, readJson, writeJson } from "../../utils/storage";

type AppSettingsContextValue = {
  isHydrated: boolean;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
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

type PersistedAppSettings = {
  displayName: string;
  hapticsEnabled: boolean;
  celebrationEffectsEnabled: boolean;
  backupEnabled: boolean;
  hasCompletedOnboarding: boolean;
};

export const AppSettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [displayName, setDisplayName] = useState("Guest Student");
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [celebrationEffectsEnabled, setCelebrationEffectsEnabled] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const persisted = await readJson<PersistedAppSettings | null>(
        STORAGE_KEYS.appSettings,
        null,
      );
      if (!persisted || !isMounted) {
        if (isMounted) {
          setIsHydrated(true);
        }
        return;
      }

      setDisplayName(persisted.displayName || "Guest Student");
      setHapticsEnabled(Boolean(persisted.hapticsEnabled));
      setCelebrationEffectsEnabled(Boolean(persisted.celebrationEffectsEnabled));
      setBackupEnabled(Boolean(persisted.backupEnabled));
      setHasCompletedOnboarding(
        typeof persisted.hasCompletedOnboarding === "boolean"
          ? persisted.hasCompletedOnboarding
          : true,
      );
      setIsHydrated(true);
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

    void writeJson<PersistedAppSettings>(STORAGE_KEYS.appSettings, {
      displayName,
      hapticsEnabled,
      celebrationEffectsEnabled,
      backupEnabled,
      hasCompletedOnboarding,
    });
  }, [
    displayName,
    hapticsEnabled,
    celebrationEffectsEnabled,
    backupEnabled,
    hasCompletedOnboarding,
    isHydrated,
  ]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      isHydrated,
      hasCompletedOnboarding,
      setHasCompletedOnboarding,
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
      isHydrated,
      hasCompletedOnboarding,
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
