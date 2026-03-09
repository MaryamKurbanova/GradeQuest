import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DB_SCHEMA_VERSION,
  DEFAULT_DATABASE_RUNTIME_STATUS,
  MIGRATIONS,
} from "../../db";

type DatabaseContextValue = {
  isReady: boolean;
  schemaVersion: number;
  pendingMigrationCount: number;
  lastInitializedAt: string | null;
  reinitialize: () => Promise<void>;
};

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

export const DatabaseProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isReady, setIsReady] = useState(DEFAULT_DATABASE_RUNTIME_STATUS.isInitialized);
  const [schemaVersion, setSchemaVersion] = useState(DEFAULT_DATABASE_RUNTIME_STATUS.schemaVersion);
  const [lastInitializedAt, setLastInitializedAt] = useState<string | null>(
    DEFAULT_DATABASE_RUNTIME_STATUS.lastInitializedAt,
  );

  const initialize = async () => {
    // Placeholder for SQLite setup + migrations.
    setIsReady(false);
    setSchemaVersion(DB_SCHEMA_VERSION);
    setLastInitializedAt(new Date().toISOString());
    setIsReady(true);
  };

  useEffect(() => {
    void initialize();
  }, []);

  const value = useMemo<DatabaseContextValue>(
    () => ({
      isReady,
      schemaVersion,
      pendingMigrationCount: Math.max(DB_SCHEMA_VERSION - MIGRATIONS.length, 0),
      lastInitializedAt,
      reinitialize: initialize,
    }),
    [isReady, schemaVersion, lastInitializedAt],
  );

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

export const useDatabase = (): DatabaseContextValue => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within DatabaseProvider");
  }
  return context;
};
