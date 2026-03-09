import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppNavigation } from "../app/navigation/NavigationContext";
import { FEATURE_FLAGS } from "../app/constants/featureFlags";
import { useGamification } from "../app/providers/GamificationProvider";
import { useSubscription } from "../app/providers/SubscriptionProvider";
import { addDays, getStartOfWeek } from "../utils/date";

type RangeKey = "weekly" | "monthly";

type TrendEntry = {
  id: string;
  label: string;
  spanLabel: string;
  tasks: number;
  points: number;
  start: Date;
  end: Date;
};

type TimeBucketKey = "morning" | "afternoon" | "evening" | "lateNight";

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const formatShortMonthDay = (date: Date): string =>
  date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

const buildWeeklyTrend = (
  rewardHistory: { awardedAt: string; points: number }[],
  anchorDate = new Date(),
): TrendEntry[] => {
  const anchor = startOfDay(anchorDate);
  const entries: TrendEntry[] = [];

  for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
    const dayDate = addDays(anchor, -dayOffset);
    entries.push({
      id: `d-${dayDate.toISOString()}`,
      label: dayDate.toLocaleDateString(undefined, { weekday: "short" }),
      spanLabel: formatShortMonthDay(dayDate),
      tasks: 0,
      points: 0,
      start: dayDate,
      end: dayDate,
    });
  }

  rewardHistory.forEach((reward) => {
    const rewardDate = startOfDay(new Date(reward.awardedAt));
    if (Number.isNaN(rewardDate.getTime())) {
      return;
    }
    entries.forEach((entry) => {
      if (rewardDate.getTime() === entry.start.getTime()) {
        entry.tasks += 1;
        entry.points += reward.points;
      }
    });
  });

  return entries;
};

const buildMonthlyTrend = (
  rewardHistory: { awardedAt: string; points: number }[],
  anchorDate = new Date(),
): TrendEntry[] => {
  const currentWeekStart = getStartOfWeek(anchorDate);
  const entries: TrendEntry[] = [];

  for (let weekOffset = 3; weekOffset >= 0; weekOffset -= 1) {
    const start = addDays(currentWeekStart, -weekOffset * 7);
    const end = addDays(start, 6);
    entries.push({
      id: `w-${start.toISOString()}`,
      label: `W${4 - weekOffset}`,
      spanLabel: `${formatShortMonthDay(start)} - ${formatShortMonthDay(end)}`,
      tasks: 0,
      points: 0,
      start,
      end,
    });
  }

  rewardHistory.forEach((reward) => {
    const rewardDate = startOfDay(new Date(reward.awardedAt));
    if (Number.isNaN(rewardDate.getTime())) {
      return;
    }
    entries.forEach((entry) => {
      if (rewardDate >= entry.start && rewardDate <= entry.end) {
        entry.tasks += 1;
        entry.points += reward.points;
      }
    });
  });

  return entries;
};

const AnalyticsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { isPremium } = useSubscription();
  const { rewardHistory, streakDays } = useGamification();
  const [range, setRange] = useState<RangeKey>("weekly");

  const chartData = useMemo(() => {
    if (range === "weekly") {
      return buildWeeklyTrend(rewardHistory);
    }
    return buildMonthlyTrend(rewardHistory);
  }, [range, rewardHistory]);

  const previousChartData = useMemo(() => {
    const now = new Date();
    if (range === "weekly") {
      return buildWeeklyTrend(rewardHistory, addDays(now, -7));
    }
    return buildMonthlyTrend(rewardHistory, addDays(now, -28));
  }, [range, rewardHistory]);

  const maxTasks = useMemo(() => Math.max(...chartData.map((entry) => entry.tasks), 1), [chartData]);
  const maxPoints = useMemo(
    () => Math.max(...chartData.map((entry) => entry.points), 1),
    [chartData],
  );

  const totalTasks = useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.tasks, 0),
    [chartData],
  );
  const totalPoints = useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.points, 0),
    [chartData],
  );
  const averageTasks = useMemo(
    () => Number((totalTasks / Math.max(chartData.length, 1)).toFixed(1)),
    [chartData.length, totalTasks],
  );
  const bestPeriod = useMemo(
    () =>
      chartData.reduce(
        (best, current) => (current.tasks > best.tasks ? current : best),
        chartData[0] ?? {
          id: "none",
          label: "-",
          spanLabel: "-",
          tasks: 0,
          points: 0,
          start: new Date(),
          end: new Date(),
        },
      ),
    [chartData],
  );

  const previousTotalTasks = useMemo(
    () => previousChartData.reduce((sum, entry) => sum + entry.tasks, 0),
    [previousChartData],
  );
  const momentumLabel = useMemo(() => {
    if (totalTasks === 0 && previousTotalTasks === 0) {
      return "No activity in the current or previous period yet.";
    }
    if (previousTotalTasks === 0) {
      return "Strong start: this period has activity while the previous one had none.";
    }
    const delta = totalTasks - previousTotalTasks;
    const deltaPercent = Math.round((Math.abs(delta) / previousTotalTasks) * 100);
    if (delta > 0) {
      return `Up ${deltaPercent}% vs previous period (${totalTasks} vs ${previousTotalTasks} tasks).`;
    }
    if (delta < 0) {
      return `Down ${deltaPercent}% vs previous period (${totalTasks} vs ${previousTotalTasks} tasks).`;
    }
    return `Holding steady at ${totalTasks} tasks vs previous period.`;
  }, [previousTotalTasks, totalTasks]);

  const assignmentCount = useMemo(
    () => rewardHistory.filter((reward) => reward.kind === "assignment").length,
    [rewardHistory],
  );
  const examCount = useMemo(
    () => rewardHistory.filter((reward) => reward.kind === "exam").length,
    [rewardHistory],
  );

  const mostProductiveDay = useMemo(() => {
    const countsByDay = new Map<number, number>();
    rewardHistory.forEach((reward) => {
      const date = new Date(reward.awardedAt);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      const day = date.getDay();
      countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1);
    });
    let bestDay = -1;
    let bestCount = 0;
    countsByDay.forEach((count, day) => {
      if (count > bestCount) {
        bestCount = count;
        bestDay = day;
      }
    });
    if (bestDay < 0) {
      return { label: "N/A", count: 0 };
    }
    const baseDate = addDays(new Date("2024-01-07T00:00:00"), bestDay);
    return {
      label: baseDate.toLocaleDateString(undefined, { weekday: "long" }),
      count: bestCount,
    };
  }, [rewardHistory]);

  const bestTimeBucket = useMemo(() => {
    const labelByBucket: Record<TimeBucketKey, string> = {
      morning: "Morning (5am-11am)",
      afternoon: "Afternoon (12pm-4pm)",
      evening: "Evening (5pm-9pm)",
      lateNight: "Late night (10pm-4am)",
    };
    const countsByBucket: Record<TimeBucketKey, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      lateNight: 0,
    };

    rewardHistory.forEach((reward) => {
      const date = new Date(reward.awardedAt);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      const hour = date.getHours();
      if (hour >= 5 && hour <= 11) {
        countsByBucket.morning += 1;
        return;
      }
      if (hour >= 12 && hour <= 16) {
        countsByBucket.afternoon += 1;
        return;
      }
      if (hour >= 17 && hour <= 21) {
        countsByBucket.evening += 1;
        return;
      }
      countsByBucket.lateNight += 1;
    });

    let bestBucket: TimeBucketKey = "morning";
    let bestCount = 0;
    (Object.keys(countsByBucket) as TimeBucketKey[]).forEach((bucket) => {
      if (countsByBucket[bucket] > bestCount) {
        bestCount = countsByBucket[bucket];
        bestBucket = bucket;
      }
    });

    return {
      label: labelByBucket[bestBucket],
      count: bestCount,
    };
  }, [rewardHistory]);

  if (!FEATURE_FLAGS.premiumAnalyticsEnabled) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedTitle}>Analytics unavailable</Text>
          <Text style={styles.lockedText}>
            Premium analytics is currently disabled in this build.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedTitle}>Analytics is Premium</Text>
          <Text style={styles.lockedText}>
            Upgrade to unlock weekly/monthly trends, points charts, productivity insights, and
            progress comparisons.
          </Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={() => navigate("paywall")}>
            <Text style={styles.upgradeButtonText}>View Premium Plans</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Analytics</Text>
        <Text style={styles.title}>Advanced progress tracking</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleChip, range === "weekly" && styles.toggleChipActive]}
            onPress={() => setRange("weekly")}
          >
            <Text style={[styles.toggleText, range === "weekly" && styles.toggleTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleChip, range === "monthly" && styles.toggleChipActive]}
            onPress={() => setRange("monthly")}
          >
            <Text style={[styles.toggleText, range === "monthly" && styles.toggleTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Completed tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Points earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streakDays}</Text>
            <Text style={styles.statLabel}>Current streak</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{averageTasks}</Text>
            <Text style={styles.statLabel}>
              Avg per {range === "weekly" ? "day" : "week"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{assignmentCount}</Text>
            <Text style={styles.statLabel}>Assignments done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{examCount}</Text>
            <Text style={styles.statLabel}>Exams done</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion trend</Text>
          <View style={styles.chartCard}>
            <View style={styles.barsRow}>
              {chartData.map((entry) => {
                const heightPercent = (entry.tasks / maxTasks) * 100;
                return (
                  <View key={entry.id} style={styles.barGroup}>
                    <Text style={styles.barValue}>{entry.tasks}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{entry.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points earned trend</Text>
          <View style={styles.chartCard}>
            <View style={styles.barsRow}>
              {chartData.map((entry) => {
                const heightPercent = (entry.points / maxPoints) * 100;
                return (
                  <View key={`${entry.id}-points`} style={styles.barGroup}>
                    <Text style={styles.barValue}>{entry.points}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.pointsBarFill, { height: `${heightPercent}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{entry.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most productive insights</Text>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Best period</Text>
            <Text style={styles.insightText}>
              {bestPeriod.spanLabel} was your strongest period with {bestPeriod.tasks} completed
              tasks and {bestPeriod.points} points.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Most productive day</Text>
            <Text style={styles.insightText}>
              {mostProductiveDay.label} leads with {mostProductiveDay.count} completed tasks.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Best study time</Text>
            <Text style={styles.insightText}>
              {bestTimeBucket.label} is your top productivity window ({bestTimeBucket.count} tasks).
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Compare over time</Text>
            <Text style={styles.insightText}>{momentumLabel}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  kicker: {
    fontSize: 16,
    color: "#52607A",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 16,
  },
  lockedContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  lockedText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  toggleChip: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  toggleChipActive: {
    backgroundColor: "#1D4ED8",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  statsGrid: {
    flexDirection: "row",
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barGroup: {
    alignItems: "center",
    width: 42,
  },
  barValue: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "600",
  },
  barTrack: {
    width: 20,
    height: 120,
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 999,
  },
  pointsBarFill: {
    width: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 999,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  insightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
  },
});

export default AnalyticsScreen;
