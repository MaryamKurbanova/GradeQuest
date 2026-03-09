import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useGamification } from "./GamificationProvider";
import { useStudyData } from "./StudyDataProvider";
import { type RouteKey } from "../navigation/types";
import { extractDateKey, getTodayDateKey } from "../../utils/date";
import { STORAGE_KEYS, readJson, writeJson } from "../../utils/storage";

type WidgetConfig = {
  showTodayAssignments: boolean;
  showUpcomingExams: boolean;
  showProgressCard: boolean;
  enableQuickAdd: boolean;
};

type WidgetSnapshot = {
  todayAssignments: number;
  upcomingExams: number;
  streakDays: number;
  points: number;
  lastUpdatedAt: string;
};

type QuickAction = {
  id: string;
  label: string;
  route: Extract<RouteKey, "assignmentForm" | "examForm">;
  description: string;
  enabled: boolean;
};

type WidgetContextValue = {
  config: WidgetConfig;
  setConfigValue: (key: keyof WidgetConfig, value: boolean) => void;
  snapshot: WidgetSnapshot;
  quickActions: QuickAction[];
};

type PersistedWidgetState = {
  config: WidgetConfig;
};

const DEFAULT_CONFIG: WidgetConfig = {
  showTodayAssignments: true,
  showUpcomingExams: true,
  showProgressCard: true,
  enableQuickAdd: true,
};

const WidgetContext = createContext<WidgetContextValue | undefined>(undefined);

export const WidgetProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { assignments, exams } = useStudyData();
  const { points, streakDays } = useGamification();
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date().toISOString());

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const persisted = await readJson<PersistedWidgetState | null>(STORAGE_KEYS.widgets, null);
      if (!isMounted) {
        return;
      }

      if (!persisted) {
        setConfig(DEFAULT_CONFIG);
        setIsHydrated(true);
        return;
      }

      setConfig({
        ...DEFAULT_CONFIG,
        ...persisted.config,
      });
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
    void writeJson<PersistedWidgetState>(STORAGE_KEYS.widgets, {
      config,
    });
  }, [config, isHydrated]);

  const todayAssignments = useMemo(() => {
    const todayKey = getTodayDateKey();
    return assignments.filter(
      (assignment) =>
        assignment.status === "pending" && extractDateKey(assignment.dueAt) === todayKey,
    ).length;
  }, [assignments]);

  const upcomingExams = useMemo(() => {
    const todayKey = getTodayDateKey();
    return exams.filter(
      (exam) => exam.status === "upcoming" && extractDateKey(exam.examAt) >= todayKey,
    ).length;
  }, [exams]);

  useEffect(() => {
    setLastUpdatedAt(new Date().toISOString());
  }, [todayAssignments, upcomingExams, points, streakDays]);

  const setConfigValue = (key: keyof WidgetConfig, value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const snapshot = useMemo<WidgetSnapshot>(
    () => ({
      todayAssignments,
      upcomingExams,
      streakDays,
      points,
      lastUpdatedAt,
    }),
    [lastUpdatedAt, points, streakDays, todayAssignments, upcomingExams],
  );

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        id: "quick-add-assignment",
        label: "Quick add assignment",
        route: "assignmentForm",
        description: "Capture homework instantly from quick access.",
        enabled: config.enableQuickAdd,
      },
      {
        id: "quick-add-exam",
        label: "Quick add exam",
        route: "examForm",
        description: "Log exams fast without opening full planning flow.",
        enabled: config.enableQuickAdd,
      },
    ],
    [config.enableQuickAdd],
  );

  const value = useMemo<WidgetContextValue>(
    () => ({
      config,
      setConfigValue,
      snapshot,
      quickActions,
    }),
    [config, quickActions, snapshot],
  );

  return <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>;
};

export const useWidgets = (): WidgetContextValue => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidgets must be used within WidgetProvider");
  }
  return context;
};
