import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, readJson, writeJson } from "../../utils/storage";

export type ThemeId = "light" | "dark" | "pastel" | "gradient" | "vibrant";
export type CourseIconStyle = "book" | "flask" | "calculator" | "globe";
export type DashboardBackgroundPreset = "default" | "aurora" | "sunset" | "midnight";
export type StreakAnimationStyle = "subtle" | "glow" | "burst";

const THEME_IDS: ThemeId[] = ["light", "dark", "pastel", "gradient", "vibrant"];
const COURSE_ICON_STYLES: CourseIconStyle[] = ["book", "flask", "calculator", "globe"];
const DASHBOARD_BACKGROUND_PRESETS: DashboardBackgroundPreset[] = [
  "default",
  "aurora",
  "sunset",
  "midnight",
];
const STREAK_ANIMATION_STYLES: StreakAnimationStyle[] = ["subtle", "glow", "burst"];

type PersistedThemeState = {
  activeTheme: ThemeId;
  courseAccentColor: string;
  courseIconStyle: CourseIconStyle;
  dashboardBackgroundPreset: DashboardBackgroundPreset;
  streakAnimationStyle: StreakAnimationStyle;
};

const DEFAULT_THEME_STATE: PersistedThemeState = {
  activeTheme: "light",
  courseAccentColor: "#6366F1",
  courseIconStyle: "book",
  dashboardBackgroundPreset: "default",
  streakAnimationStyle: "subtle",
};

type ThemeContextValue = {
  activeTheme: ThemeId;
  setActiveTheme: (theme: ThemeId) => void;
  courseAccentColor: string;
  setCourseAccentColor: (colorHex: string) => void;
  courseIconStyle: CourseIconStyle;
  setCourseIconStyle: (style: CourseIconStyle) => void;
  dashboardBackgroundPreset: DashboardBackgroundPreset;
  setDashboardBackgroundPreset: (preset: DashboardBackgroundPreset) => void;
  streakAnimationStyle: StreakAnimationStyle;
  setStreakAnimationStyle: (style: StreakAnimationStyle) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(DEFAULT_THEME_STATE.activeTheme);
  const [courseAccentColor, setCourseAccentColor] = useState(DEFAULT_THEME_STATE.courseAccentColor);
  const [courseIconStyle, setCourseIconStyle] = useState<CourseIconStyle>(
    DEFAULT_THEME_STATE.courseIconStyle,
  );
  const [dashboardBackgroundPreset, setDashboardBackgroundPreset] =
    useState<DashboardBackgroundPreset>(DEFAULT_THEME_STATE.dashboardBackgroundPreset);
  const [streakAnimationStyle, setStreakAnimationStyle] = useState<StreakAnimationStyle>(
    DEFAULT_THEME_STATE.streakAnimationStyle,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const persistedTheme = await readJson<PersistedThemeState | ThemeId | null>(
        STORAGE_KEYS.theme,
        null,
      );
      if (persistedTheme && isMounted) {
        if (typeof persistedTheme === "string") {
          if (THEME_IDS.includes(persistedTheme)) {
            setActiveTheme(persistedTheme);
          }
        } else {
          setActiveTheme(
            THEME_IDS.includes(persistedTheme.activeTheme)
              ? persistedTheme.activeTheme
              : DEFAULT_THEME_STATE.activeTheme,
          );
          setCourseAccentColor(
            persistedTheme.courseAccentColor || DEFAULT_THEME_STATE.courseAccentColor,
          );
          setCourseIconStyle(
            COURSE_ICON_STYLES.includes(persistedTheme.courseIconStyle)
              ? persistedTheme.courseIconStyle
              : DEFAULT_THEME_STATE.courseIconStyle,
          );
          setDashboardBackgroundPreset(
            DASHBOARD_BACKGROUND_PRESETS.includes(persistedTheme.dashboardBackgroundPreset)
              ? persistedTheme.dashboardBackgroundPreset
              : DEFAULT_THEME_STATE.dashboardBackgroundPreset,
          );
          setStreakAnimationStyle(
            STREAK_ANIMATION_STYLES.includes(persistedTheme.streakAnimationStyle)
              ? persistedTheme.streakAnimationStyle
              : DEFAULT_THEME_STATE.streakAnimationStyle,
          );
        }
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
    void writeJson<PersistedThemeState>(STORAGE_KEYS.theme, {
      activeTheme,
      courseAccentColor,
      courseIconStyle,
      dashboardBackgroundPreset,
      streakAnimationStyle,
    });
  }, [
    activeTheme,
    courseAccentColor,
    courseIconStyle,
    dashboardBackgroundPreset,
    streakAnimationStyle,
    isHydrated,
  ]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      activeTheme,
      setActiveTheme,
      courseAccentColor,
      setCourseAccentColor,
      courseIconStyle,
      setCourseIconStyle,
      dashboardBackgroundPreset,
      setDashboardBackgroundPreset,
      streakAnimationStyle,
      setStreakAnimationStyle,
    }),
    [
      activeTheme,
      courseAccentColor,
      courseIconStyle,
      dashboardBackgroundPreset,
      streakAnimationStyle,
    ],
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
