import React, { createContext, useContext, useMemo, useState } from "react";

export type ThemeId = "light" | "dark" | "pastel" | "gradient" | "vibrant";

type ThemeContextValue = {
  activeTheme: ThemeId;
  setActiveTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeId>("light");

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
