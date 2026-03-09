import React, { useMemo } from "react";
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
import { useAppSettings } from "../app/providers/AppSettingsProvider";
import { useGamification } from "../app/providers/GamificationProvider";
import { useStudyData } from "../app/providers/StudyDataProvider";
import { useSubscription } from "../app/providers/SubscriptionProvider";
import { useTheme } from "../app/providers/ThemeProvider";
import { DESIGN } from "../app/theme/design";
import {
  extractDateKey,
  formatShortDateLabel,
  formatShortTimeLabel,
  getTodayDateKey,
  parseAppDateTime,
} from "../utils/date";

const DASHBOARD_BACKGROUND_COLORS = {
  default: DESIGN.colors.appBg,
  aurora: DESIGN.colors.surfaceSoft,
  sunset: "#FFF9F1",
  midnight: "#EBEEF2",
} as const;

const COURSE_ICON_LABELS = {
  book: "BOOK",
  flask: "LAB",
  calculator: "MATH",
  globe: "GLOBAL",
} as const;

const DashboardScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { displayName } = useAppSettings();
  const { isPremium } = useSubscription();
  const {
    courseAccentColor,
    courseIconStyle,
    dashboardBackgroundPreset,
    streakAnimationStyle,
  } = useTheme();
  const { points, streakDays, level } = useGamification();
  const { assignments, exams, courses } = useStudyData();

  const todayKey = useMemo(() => getTodayDateKey(), []);
  const courseNameMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course.name])),
    [courses],
  );

  const pendingAssignments = assignments.filter((assignment) => assignment.status === "pending");
  const todayAssignments = pendingAssignments
    .filter((assignment) => {
      const dueKey = extractDateKey(assignment.dueAt);
      return dueKey.length > 0 && dueKey <= todayKey;
    })
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 5);

  const upcomingExams = exams
    .filter((exam) => exam.status === "upcoming" && extractDateKey(exam.examAt) >= todayKey)
    .sort((a, b) => a.examAt.localeCompare(b.examAt))
    .slice(0, 5);
  const courseIconTag = COURSE_ICON_LABELS[courseIconStyle];
  const dashboardBackgroundColor = DASHBOARD_BACKGROUND_COLORS[dashboardBackgroundPreset];

  const streakCardStyle =
    streakAnimationStyle === "glow"
      ? styles.streakCardGlow
      : streakAnimationStyle === "burst"
        ? styles.streakCardBurst
        : styles.streakCardSubtle;

  const onAddAssignment = () => {
    navigate("assignmentForm");
  };

  const onAddExam = () => {
    navigate("examForm");
  };

  const onOpenQuickAccess = () => {
    if (!FEATURE_FLAGS.premiumWidgetsEnabled) {
      return;
    }
    if (!isPremium) {
      navigate("paywall");
      return;
    }
    navigate("widgets");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: dashboardBackgroundColor }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Welcome back{displayName ? `, ${displayName}` : ""}</Text>
        <Text style={styles.title}>Today at a glance</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, streakCardStyle, { borderColor: courseAccentColor }]}>
            <Text style={styles.statNumber}>{streakDays}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>L{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: courseAccentColor }]}
            onPress={onAddAssignment}
          >
            <Text style={styles.primaryActionText}>+ Add Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={onAddExam}>
            <Text style={styles.secondaryActionText}>+ Add Exam</Text>
          </TouchableOpacity>
        </View>

        {FEATURE_FLAGS.premiumWidgetsEnabled ? (
          <TouchableOpacity
            style={[styles.quickAccessButton, { borderColor: courseAccentColor }]}
            onPress={onOpenQuickAccess}
          >
            <Text style={styles.quickAccessTitle}>
              {isPremium ? "Widgets & quick access" : "Unlock widgets & quick access"}
            </Text>
            <Text style={styles.quickAccessSubtitle}>
              {isPremium
                ? "Use home-style preview cards and quick-add shortcuts."
                : "Premium feature: widget previews and one-tap quick add."}
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's assignments</Text>
          {todayAssignments.length === 0 ? (
            <View style={styles.itemCard}>
              <Text style={styles.itemTitle}>No assignments due today</Text>
              <Text style={styles.itemMeta}>Great progress. Add a new assignment to stay ahead.</Text>
            </View>
          ) : (
            todayAssignments.map((assignment) => {
              const dueDate = parseAppDateTime(assignment.dueAt);
              const isOverdue = !!dueDate && dueDate.getTime() < Date.now();
              return (
                <View key={assignment.id} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemTitle}>{assignment.title}</Text>
                    {isOverdue ? (
                      <View style={styles.overduePill}>
                        <Text style={styles.overdueText}>Overdue</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.itemMeta}>
                    {courseIconTag} • {courseNameMap.get(assignment.courseId) ?? "Unknown Course"} • Due{" "}
                    {formatShortDateLabel(assignment.dueAt)} {formatShortTimeLabel(assignment.dueAt)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming exams</Text>
          {upcomingExams.length === 0 ? (
            <View style={styles.itemCard}>
              <Text style={styles.itemTitle}>No upcoming exams</Text>
              <Text style={styles.itemMeta}>Add exam dates to keep your revision on track.</Text>
            </View>
          ) : (
            upcomingExams.map((exam) => (
              <View key={exam.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{exam.title}</Text>
                <Text style={styles.itemMeta}>
                  {courseIconTag} • {courseNameMap.get(exam.courseId) ?? "Unknown Course"} •{" "}
                  {formatShortDateLabel(exam.examAt)} {formatShortTimeLabel(exam.examAt)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DESIGN.colors.appBg,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  greeting: {
    fontSize: 14,
    color: DESIGN.colors.textMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: DESIGN.typography.headline,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    paddingVertical: 13,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    alignItems: "center",
    ...DESIGN.shadow.card,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: DESIGN.colors.textMuted,
    marginTop: 3,
  },
  actionsRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: DESIGN.colors.primary,
    borderRadius: DESIGN.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 6,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 6,
  },
  secondaryActionText: {
    color: DESIGN.colors.textPrimary,
    fontWeight: "600",
  },
  quickAccessButton: {
    backgroundColor: DESIGN.colors.surfaceSoft,
    borderWidth: 1.5,
    borderRadius: DESIGN.radius.md,
    padding: 14,
    marginBottom: 14,
    ...DESIGN.shadow.card,
  },
  streakCardSubtle: {
    borderWidth: 1,
    backgroundColor: DESIGN.colors.surfaceSoft,
  },
  streakCardGlow: {
    borderWidth: 1.5,
    backgroundColor: DESIGN.colors.accentLimeSoft,
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  streakCardBurst: {
    borderWidth: 1.5,
    backgroundColor: DESIGN.colors.accentLimeSoft,
    shadowOpacity: 0.08,
    shadowRadius: 9,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  quickAccessSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: DESIGN.colors.textMuted,
    lineHeight: 18,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: DESIGN.typography.section,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
    marginBottom: 9,
  },
  itemCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    padding: 12,
    marginBottom: 9,
    ...DESIGN.shadow.card,
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
  },
  itemMeta: {
    fontSize: DESIGN.typography.body,
    color: DESIGN.colors.textMuted,
  },
  overduePill: {
    backgroundColor: "#FEE2E2",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  overdueText: {
    color: "#B91C1C",
    fontSize: 11,
    fontWeight: "600",
  },
});

export default DashboardScreen;
