import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStudyData } from "../app/providers/StudyDataProvider";
import { useSubscription } from "../app/providers/SubscriptionProvider";
import {
  extractDateKey,
  formatShortTimeLabel,
  getRelativeDayLabel,
  getTodayDateKey,
  toDateKey,
} from "../utils/date";

type Badge = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  premium?: boolean;
};

type RewardActivity = {
  id: string;
  label: string;
  points: number;
  timeLabel: string;
};

const POINTS_PER_ASSIGNMENT = 10;
const POINTS_PER_EXAM = 30;
const DAILY_STREAK_BONUS = 5;
const LEVEL_STEP = 100;

const calculateStreakDays = (completionDateValues: string[]): number => {
  const uniqueDays = new Set(
    completionDateValues
      .map((value) => extractDateKey(value))
      .filter((dayKey) => dayKey.length > 0),
  );

  if (uniqueDays.size === 0) {
    return 0;
  }

  let cursor = new Date();
  if (!uniqueDays.has(getTodayDateKey())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (uniqueDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const GamificationScreen: React.FC = () => {
  const { assignments, exams } = useStudyData();
  const { isPremium } = useSubscription();

  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === "completed",
  );
  const completedExams = exams.filter((exam) => exam.status === "completed");
  const completedTotal = completedAssignments.length + completedExams.length;

  const completionDateValues = [
    ...completedAssignments
      .map((assignment) => assignment.completedAt)
      .filter((value): value is string => !!value),
    ...completedExams
      .map((exam) => exam.completedAt)
      .filter((value): value is string => !!value),
  ];

  const streakDays = calculateStreakDays(completionDateValues);
  const points =
    completedAssignments.length * POINTS_PER_ASSIGNMENT +
    completedExams.length * POINTS_PER_EXAM +
    streakDays * DAILY_STREAK_BONUS;
  const level = Math.floor(points / LEVEL_STEP) + 1;
  const currentLevelBase = (level - 1) * LEVEL_STEP;
  const nextLevelTarget = level * LEVEL_STEP;
  const progressPercent = Math.min(
    ((points - currentLevelBase) / (nextLevelTarget - currentLevelBase)) * 100,
    100,
  );

  const badges: Badge[] = [
    {
      id: "b1",
      name: "First Win",
      description: "Complete your first assignment or exam",
      unlocked: completedTotal >= 1,
    },
    {
      id: "b2",
      name: "7-Day Streak",
      description: "Stay consistent for 7 days",
      unlocked: streakDays >= 7,
    },
    {
      id: "b3",
      name: "Exam Crusher",
      description: "Finish 5 exams",
      unlocked: completedExams.length >= 5,
    },
    {
      id: "b4",
      name: "Legendary Focus",
      description: "Complete 30 tasks in a month",
      unlocked: isPremium && completedTotal >= 30,
      premium: true,
    },
  ];

  const recentRewards: RewardActivity[] = [
    ...completedAssignments
      .filter((assignment) => !!assignment.completedAt)
      .map((assignment) => ({
        id: `assignment-${assignment.id}`,
        label: `Completed ${assignment.title}`,
        points: POINTS_PER_ASSIGNMENT,
        completedAt: assignment.completedAt as string,
      })),
    ...completedExams
      .filter((exam) => !!exam.completedAt)
      .map((exam) => ({
        id: `exam-${exam.id}`,
        label: `Completed ${exam.title}`,
        points: POINTS_PER_EXAM,
        completedAt: exam.completedAt as string,
      })),
  ]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      label: item.label,
      points: item.points,
      timeLabel: `${getRelativeDayLabel(item.completedAt)} • ${formatShortTimeLabel(item.completedAt)}`,
    }));

  const unlockedBadges = badges.filter((badge) => badge.unlocked).length;
  const pointsToNextLevel = Math.max(nextLevelTarget - points, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Gamification</Text>
        <Text style={styles.title}>Your progress journey</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streakDays}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>L{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelHeaderRow}>
            <Text style={styles.levelTitle}>Level progress</Text>
            <Text style={styles.levelMeta}>
              {points}/{nextLevelTarget} XP
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            {pointsToNextLevel} points to next level
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <Text style={styles.sectionMeta}>
              {unlockedBadges}/{badges.length} unlocked
            </Text>
          </View>

          {badges.map((badge) => (
            <View key={badge.id} style={styles.badgeCard}>
              <View style={styles.badgeTextWrap}>
                <View style={styles.badgeTitleRow}>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  {badge.premium ? (
                    <View style={styles.premiumPill}>
                      <Text style={styles.premiumPillText}>Premium</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>

              <View
                style={[
                  styles.badgeStatusPill,
                  badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked,
                ]}
              >
                <Text
                  style={[
                    styles.badgeStatusText,
                    badge.unlocked ? styles.badgeUnlockedText : styles.badgeLockedText,
                  ]}
                >
                  {badge.unlocked ? "Unlocked" : "Locked"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent rewards</Text>
          {recentRewards.length === 0 ? (
            <View style={styles.rewardCard}>
              <View style={styles.rewardTextWrap}>
                <Text style={styles.rewardLabel}>No rewards yet</Text>
                <Text style={styles.rewardTime}>
                  Complete assignments and exams to start earning points.
                </Text>
              </View>
            </View>
          ) : (
            recentRewards.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardTextWrap}>
                  <Text style={styles.rewardLabel}>{reward.label}</Text>
                  <Text style={styles.rewardTime}>{reward.timeLabel}</Text>
                </View>
                <Text style={styles.rewardPoints}>+{reward.points}</Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>View premium rewards</Text>
        </TouchableOpacity>
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#0B1324",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },
  levelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    marginBottom: 16,
  },
  levelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  levelMeta: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  progressTrack: {
    height: 10,
    width: "100%",
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 999,
  },
  progressHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionMeta: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  badgeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  badgeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginRight: 8,
  },
  badgeDescription: {
    fontSize: 13,
    color: "#64748B",
  },
  premiumPill: {
    backgroundColor: "#EDE9FE",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  premiumPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6D28D9",
  },
  badgeStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeUnlocked: {
    backgroundColor: "#DCFCE7",
  },
  badgeLocked: {
    backgroundColor: "#F1F5F9",
  },
  badgeStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeUnlockedText: {
    color: "#166534",
  },
  badgeLockedText: {
    color: "#475569",
  },
  rewardCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  rewardLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  rewardTime: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },
  rewardPoints: {
    fontSize: 16,
    fontWeight: "700",
    color: "#15803D",
  },
  ctaButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default GamificationScreen;
