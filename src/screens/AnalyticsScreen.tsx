import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSubscription } from "../app/providers/SubscriptionProvider";

type RangeKey = "weekly" | "monthly";

type DayProductivity = {
  label: string;
  completed: number;
};

const WEEKLY_DATA: DayProductivity[] = [
  { label: "Mon", completed: 4 },
  { label: "Tue", completed: 5 },
  { label: "Wed", completed: 3 },
  { label: "Thu", completed: 7 },
  { label: "Fri", completed: 6 },
  { label: "Sat", completed: 2 },
  { label: "Sun", completed: 5 },
];

const MONTHLY_DATA: DayProductivity[] = [
  { label: "W1", completed: 22 },
  { label: "W2", completed: 26 },
  { label: "W3", completed: 19 },
  { label: "W4", completed: 28 },
];

const AnalyticsScreen: React.FC = () => {
  const [range, setRange] = useState<RangeKey>("weekly");
  const { isPremium, startMockPremium } = useSubscription();

  const chartData = range === "weekly" ? WEEKLY_DATA : MONTHLY_DATA;
  const maxValue = useMemo(
    () => Math.max(...chartData.map((item) => item.completed), 1),
    [chartData],
  );
  const totalCompleted = useMemo(
    () => chartData.reduce((sum, item) => sum + item.completed, 0),
    [chartData],
  );
  const averageCompleted = useMemo(
    () => Number((totalCompleted / chartData.length).toFixed(1)),
    [chartData.length, totalCompleted],
  );
  const bestEntry = useMemo(
    () => chartData.reduce((best, current) => (current.completed > best.completed ? current : best)),
    [chartData],
  );

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedTitle}>Analytics is Premium</Text>
          <Text style={styles.lockedText}>
            Upgrade to unlock weekly/monthly productivity insights and trend charts.
          </Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={() => startMockPremium("monthly")}>
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
        <Text style={styles.title}>Track your consistency</Text>

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
            <Text style={styles.statNumber}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>Tasks done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{averageCompleted}</Text>
            <Text style={styles.statLabel}>Avg per period</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{bestEntry.label}</Text>
            <Text style={styles.statLabel}>Best period</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion trend</Text>
          <View style={styles.chartCard}>
            <View style={styles.barsRow}>
              {chartData.map((item) => {
                const heightPercent = (item.completed / maxValue) * 100;
                return (
                  <View key={item.label} style={styles.barGroup}>
                    <Text style={styles.barValue}>{item.completed}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most productive insights</Text>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Best day/period</Text>
            <Text style={styles.insightText}>
              {bestEntry.label} was your strongest period with {bestEntry.completed} completed tasks.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Momentum check</Text>
            <Text style={styles.insightText}>
              You average {averageCompleted} completed tasks per {range === "weekly" ? "day" : "week"}.
              Keep this pace to maintain your streak.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Suggested target</Text>
            <Text style={styles.insightText}>
              Aim for +1 completed task in your lowest period to steadily improve consistency.
            </Text>
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
    marginBottom: 16,
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
