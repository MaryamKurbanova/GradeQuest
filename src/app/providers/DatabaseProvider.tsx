import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type DatabaseContextValue = {
  isReady: boolean;
  lastInitializedAt: string | null;
  reinitialize: () => Promise<void>;
};

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

export const DatabaseProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [lastInitializedAt, setLastInitializedAt] = useState<string | null>(null);

  const initialize = async () => {
    // Placeholder for SQLite setup + migrations.
    setIsReady(false);
    setLastInitializedAt(new Date().toISOString());
    setIsReady(true);
  };

  useEffect(() => {
    void initialize();
  }, []);

  const value = useMemo<DatabaseContextValue>(
    () => ({
      isReady,
      lastInitializedAt,
      reinitialize: initialize,
    }),
    [isReady, lastInitializedAt],
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
