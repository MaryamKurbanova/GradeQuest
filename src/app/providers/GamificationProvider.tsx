import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useStudyData } from "./StudyDataProvider";
import { useSubscription } from "./SubscriptionProvider";
import { extractDateKey, getTodayDateKey, toDateKey } from "../../utils/date";
import { STORAGE_KEYS, readJson, writeJson } from "../../utils/storage";

type RewardKind = "assignment" | "exam";

export type RewardEntry = {
  id: string;
  kind: RewardKind;
  sourceId: string;
  title: string;
  points: number;
  awardedAt: string;
  premiumBoostApplied: boolean;
};

type BadgeState = {
  id: string;
  name: string;
  description: string;
  premium: boolean;
  unlocked: boolean;
};

type GrantCompletionRewardInput = {
  kind: RewardKind;
  sourceId: string;
  title: string;
};

type GamificationContextValue = {
  points: number;
  streakDays: number;
  level: number;
  nextLevelTarget: number;
  progressPercent: number;
  rewardMultiplier: number;
  rewardHistory: RewardEntry[];
  recentRewards: RewardEntry[];
  badges: BadgeState[];
  grantCompletionReward: (input: GrantCompletionRewardInput) => boolean;
};

type PersistedGamification = {
  rewardedSourceKeys: string[];
  rewards: RewardEntry[];
};

const ASSIGNMENT_BASE_POINTS = 20;
const EXAM_BASE_POINTS = 30;
const LEVEL_STEP = 100;
const PREMIUM_MULTIPLIER = 1.5;
const MAX_REWARDS = 200;
const MAX_RECENT_REWARDS = 5;

const getMonthKey = (rawDate: string): string => {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return rawDate.slice(0, 7);
  }
  const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
  return `${parsed.getFullYear()}-${month}`;
};

const getStreakDays = (rewardEvents: RewardEntry[]): number => {
  const completionDays = new Set(
    rewardEvents.map((item) => extractDateKey(item.awardedAt)).filter((dayKey) => dayKey.length > 0),
  );
  if (completionDays.size === 0) {
    return 0;
  }

  let cursor = new Date();
  const todayKey = getTodayDateKey();
  if (!completionDays.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (completionDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);

export const GamificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { assignments, exams, isHydrated: isStudyHydrated } = useStudyData();
  const { isPremium } = useSubscription();

  const [rewardedSourceKeys, setRewardedSourceKeys] = useState<string[]>([]);
  const [rewards, setRewards] = useState<RewardEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const rewardedSourceSetRef = useRef(new Set<string>());
  const bootstrapAttemptedRef = useRef(false);

  useEffect(() => {
    rewardedSourceSetRef.current = new Set(rewardedSourceKeys);
  }, [rewardedSourceKeys]);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const persisted = await readJson<PersistedGamification | null>(STORAGE_KEYS.gamification, null);
      if (!isMounted) {
        return;
      }

      if (!persisted) {
        setRewardedSourceKeys([]);
        setRewards([]);
        setIsHydrated(true);
        return;
      }

      setRewardedSourceKeys(
        Array.isArray(persisted.rewardedSourceKeys) ? persisted.rewardedSourceKeys : [],
      );
      setRewards(Array.isArray(persisted.rewards) ? persisted.rewards.slice(0, MAX_REWARDS) : []);
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

    void writeJson<PersistedGamification>(STORAGE_KEYS.gamification, {
      rewardedSourceKeys,
      rewards,
    });
  }, [isHydrated, rewardedSourceKeys, rewards]);

  useEffect(() => {
    if (!isHydrated || !isStudyHydrated || bootstrapAttemptedRef.current) {
      return;
    }
    bootstrapAttemptedRef.current = true;

    if (rewardedSourceKeys.length > 0 || rewards.length > 0) {
      return;
    }

    const recoveredFromAssignments: RewardEntry[] = assignments
      .filter((item) => item.status === "completed")
      .map((item) => ({
        id: `seed-assignment-${item.id}`,
        kind: "assignment" as const,
        sourceId: item.id,
        title: item.title,
        points: ASSIGNMENT_BASE_POINTS,
        awardedAt: item.completedAt ?? item.updatedAt,
        premiumBoostApplied: false,
      }));

    const recoveredFromExams: RewardEntry[] = exams
      .filter((item) => item.status === "completed")
      .map((item) => ({
        id: `seed-exam-${item.id}`,
        kind: "exam" as const,
        sourceId: item.id,
        title: item.title,
        points: EXAM_BASE_POINTS,
        awardedAt: item.completedAt ?? item.updatedAt,
        premiumBoostApplied: false,
      }));

    const dedupedBySourceKey = new Map<string, RewardEntry>();
    [...recoveredFromAssignments, ...recoveredFromExams]
      .sort((a, b) => b.awardedAt.localeCompare(a.awardedAt))
      .forEach((item) => {
        const sourceKey = `${item.kind}:${item.sourceId}`;
        if (!dedupedBySourceKey.has(sourceKey)) {
          dedupedBySourceKey.set(sourceKey, item);
        }
      });

    const recoveredRewards = [...dedupedBySourceKey.values()];
    if (recoveredRewards.length === 0) {
      return;
    }

    setRewards(recoveredRewards.slice(0, MAX_REWARDS));
    setRewardedSourceKeys(recoveredRewards.map((item) => `${item.kind}:${item.sourceId}`));
  }, [assignments, exams, isHydrated, isStudyHydrated, rewardedSourceKeys.length, rewards.length]);

  const grantCompletionReward = useCallback(
    (input: GrantCompletionRewardInput): boolean => {
      const sourceKey = `${input.kind}:${input.sourceId}`;
      if (rewardedSourceSetRef.current.has(sourceKey)) {
        return false;
      }

      rewardedSourceSetRef.current.add(sourceKey);
      setRewardedSourceKeys((prev) => [sourceKey, ...prev]);

      const basePoints = input.kind === "exam" ? EXAM_BASE_POINTS : ASSIGNMENT_BASE_POINTS;
      const awardedPoints = Math.round(basePoints * (isPremium ? PREMIUM_MULTIPLIER : 1));
      const reward: RewardEntry = {
        id: `${Date.now()}-${input.kind}-${input.sourceId}`,
        kind: input.kind,
        sourceId: input.sourceId,
        title: input.title,
        points: awardedPoints,
        awardedAt: new Date().toISOString(),
        premiumBoostApplied: isPremium,
      };

      setRewards((prev) => [reward, ...prev].slice(0, MAX_REWARDS));
      return true;
    },
    [isPremium],
  );

  const value = useMemo<GamificationContextValue>(() => {
    const rewardHistory = [...rewards].sort((a, b) => b.awardedAt.localeCompare(a.awardedAt));
    const points = rewards.reduce((sum, reward) => sum + reward.points, 0);
    const level = Math.floor(points / LEVEL_STEP) + 1;
    const nextLevelTarget = level * LEVEL_STEP;
    const currentLevelFloor = (level - 1) * LEVEL_STEP;
    const progressPercent = Math.min(
      ((points - currentLevelFloor) / (nextLevelTarget - currentLevelFloor)) * 100,
      100,
    );
    const streakDays = getStreakDays(rewards);

    const assignmentCompletionCount = rewards.filter((reward) => reward.kind === "assignment").length;
    const examCompletionCount = rewards.filter((reward) => reward.kind === "exam").length;
    const totalCompletions = assignmentCompletionCount + examCompletionCount;
    const premiumBoostCount = rewards.filter((reward) => reward.premiumBoostApplied).length;
    const currentMonthKey = getMonthKey(new Date().toISOString());
    const currentMonthCompletionCount = rewards.filter(
      (reward) => getMonthKey(reward.awardedAt) === currentMonthKey,
    ).length;

    const badges: BadgeState[] = [
      {
        id: "first-win",
        name: "First Win",
        description: "Complete your first assignment or exam",
        premium: false,
        unlocked: totalCompletions >= 1,
      },
      {
        id: "focus-run",
        name: "Focus Run",
        description: "Complete 25 tasks",
        premium: false,
        unlocked: totalCompletions >= 25,
      },
      {
        id: "exam-crusher",
        name: "Exam Crusher",
        description: "Complete 5 exams",
        premium: false,
        unlocked: examCompletionCount >= 5,
      },
      {
        id: "consistency-7",
        name: "7-Day Streak",
        description: "Stay consistent for 7 days",
        premium: false,
        unlocked: streakDays >= 7,
      },
      {
        id: "xp-master",
        name: "XP Master",
        description: "Earn 500 points",
        premium: false,
        unlocked: points >= 500,
      },
      {
        id: "premium-burst",
        name: "Premium Burst",
        description: "Earn 10 premium boosted rewards",
        premium: true,
        unlocked: isPremium && premiumBoostCount >= 10,
      },
      {
        id: "legendary-focus",
        name: "Legendary Focus",
        description: "Complete 30 tasks in a month",
        premium: true,
        unlocked: isPremium && currentMonthCompletionCount >= 30,
      },
    ];

    return {
      points,
      streakDays,
      level,
      nextLevelTarget,
      progressPercent,
      rewardMultiplier: isPremium ? PREMIUM_MULTIPLIER : 1,
      rewardHistory,
      recentRewards: rewardHistory.slice(0, MAX_RECENT_REWARDS),
      badges,
      grantCompletionReward,
    };
  }, [grantCompletionReward, isPremium, rewards]);

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
};

export const useGamification = (): GamificationContextValue => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within GamificationProvider");
  }
  return context;
};
