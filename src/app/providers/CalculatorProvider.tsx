import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { FREE_TIER_LIMITS } from "../constants/pricing";
import { STORAGE_KEYS, readJson, writeJson } from "../../utils/storage";

type CalculatorResultState = "success" | "secured" | "notPossible";

export type CalculatorHistoryEntry = {
  id: string;
  currentGrade: number;
  examWeight: number;
  targetGrade: number;
  neededScore: number;
  resultState: CalculatorResultState;
  createdAt: string;
};

type RecordCalculationInput = {
  currentGrade: number;
  examWeight: number;
  targetGrade: number;
  neededScore: number;
  resultState: CalculatorResultState;
  isPremium: boolean;
};

type CalculatorContextValue = {
  usageCount: number;
  remainingFreeUses: number;
  history: CalculatorHistoryEntry[];
  canUseCalculator: (isPremium: boolean) => boolean;
  recordCalculation: (input: RecordCalculationInput) => void;
};

type PersistedCalculator = {
  usageMonthKey: string;
  usageCount: number;
  history: CalculatorHistoryEntry[];
};

const DEFAULT_FREE_LIMIT = FREE_TIER_LIMITS.gradeCalculatorMonthlyEntries;
const MAX_HISTORY_ITEMS = 5;

const getCurrentMonthKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
};

const CalculatorContext = createContext<CalculatorContextValue | undefined>(undefined);

export const CalculatorProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [usageMonthKey, setUsageMonthKey] = useState(getCurrentMonthKey());
  const [usageCount, setUsageCount] = useState(0);
  const [history, setHistory] = useState<CalculatorHistoryEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const persisted = await readJson<PersistedCalculator | null>(STORAGE_KEYS.calculator, null);
      if (!isMounted) {
        return;
      }

      const currentMonthKey = getCurrentMonthKey();
      if (!persisted) {
        setUsageMonthKey(currentMonthKey);
        setUsageCount(0);
        setHistory([]);
        setIsHydrated(true);
        return;
      }

      setUsageMonthKey(currentMonthKey);
      setUsageCount(persisted.usageMonthKey === currentMonthKey ? persisted.usageCount : 0);
      setHistory(Array.isArray(persisted.history) ? persisted.history.slice(0, MAX_HISTORY_ITEMS) : []);
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

    void writeJson<PersistedCalculator>(STORAGE_KEYS.calculator, {
      usageMonthKey,
      usageCount,
      history,
    });
  }, [history, isHydrated, usageCount, usageMonthKey]);

  const currentMonthKey = getCurrentMonthKey();
  const effectiveUsageCount = usageMonthKey === currentMonthKey ? usageCount : 0;

  const canUseCalculator = useCallback(
    (isPremium: boolean): boolean => {
      if (isPremium) {
        return true;
      }
      return effectiveUsageCount < DEFAULT_FREE_LIMIT;
    },
    [effectiveUsageCount],
  );

  const recordCalculation = useCallback((input: RecordCalculationInput) => {
    const monthKey = getCurrentMonthKey();
    const previousCount = usageMonthKey === monthKey ? usageCount : 0;
    const nextCount = input.isPremium ? previousCount : previousCount + 1;

    setUsageMonthKey(monthKey);
    setUsageCount(nextCount);

    const nextEntry: CalculatorHistoryEntry = {
      id: `${Date.now()}`,
      currentGrade: input.currentGrade,
      examWeight: input.examWeight,
      targetGrade: input.targetGrade,
      neededScore: input.neededScore,
      resultState: input.resultState,
      createdAt: new Date().toISOString(),
    };

    setHistory((prev) => [nextEntry, ...prev].slice(0, MAX_HISTORY_ITEMS));
  }, [usageCount, usageMonthKey]);

  const value = useMemo<CalculatorContextValue>(
    () => ({
      usageCount: effectiveUsageCount,
      remainingFreeUses: Math.max(DEFAULT_FREE_LIMIT - effectiveUsageCount, 0),
      history,
      canUseCalculator,
      recordCalculation,
    }),
    [canUseCalculator, effectiveUsageCount, history, recordCalculation],
  );

  return <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>;
};

export const useCalculator = (): CalculatorContextValue => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error("useCalculator must be used within CalculatorProvider");
  }
  return context;
};
