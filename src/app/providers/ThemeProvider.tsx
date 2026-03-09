import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, readJson, writeJson } from "../../utils/storage";

export type ThemeId = "light" | "dark" | "pastel" | "gradient" | "vibrant";

type ThemeContextValue = {
  activeTheme: ThemeId;
  setActiveTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeId>("light");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const persistedTheme = await readJson<ThemeId | null>(STORAGE_KEYS.theme, null);
      if (persistedTheme && isMounted) {
        setActiveTheme(persistedTheme);
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
    void writeJson<ThemeId>(STORAGE_KEYS.theme, activeTheme);
  }, [activeTheme, isHydrated]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      activeTheme,
      setActiveTheme,
    }),
    [activeTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
