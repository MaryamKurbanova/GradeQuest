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
import { useAppSettings } from "../app/providers/AppSettingsProvider";
import { useStudyData } from "../app/providers/StudyDataProvider";
import {
  extractDateKey,
  formatShortDateLabel,
  formatShortTimeLabel,
  getTodayDateKey,
  parseAppDateTime,
  toDateKey,
} from "../utils/date";

const DAILY_STREAK_BONUS = 5;

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
  const todayKey = getTodayDateKey();
  if (!uniqueDays.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (uniqueDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const DashboardScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { displayName } = useAppSettings();
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

  const completedAssignmentsCount = assignments.filter(
    (assignment) => assignment.status === "completed",
  ).length;
  const completedExamsCount = exams.filter((exam) => exam.status === "completed").length;
  const completionDateValues = [
    ...assignments
      .filter((assignment) => assignment.status === "completed" && assignment.completedAt)
      .map((assignment) => assignment.completedAt as string),
    ...exams
      .filter((exam) => exam.status === "completed" && exam.completedAt)
      .map((exam) => exam.completedAt as string),
  ];
  const streakDays = calculateStreakDays(completionDateValues);
  const points = completedAssignmentsCount * 10 + completedExamsCount * 30 + streakDays * DAILY_STREAK_BONUS;
  const level = Math.floor(points / 100) + 1;

  const onAddAssignment = () => {
    navigate("assignmentForm");
  };

  const onAddExam = () => {
    navigate("examForm");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Welcome back{displayName ? `, ${displayName}` : ""}</Text>
        <Text style={styles.title}>Today at a glance</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
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
          <TouchableOpacity style={styles.primaryAction} onPress={onAddAssignment}>
            <Text style={styles.primaryActionText}>+ Add Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={onAddExam}>
            <Text style={styles.secondaryActionText}>+ Add Exam</Text>
          </TouchableOpacity>
        </View>

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
                    {courseNameMap.get(assignment.courseId) ?? "Unknown Course"} - Due{" "}
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
                  {courseNameMap.get(exam.courseId) ?? "Unknown Course"} -{" "}
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
    backgroundColor: "#F5F7FB",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  greeting: {
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
  actionsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 6,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 6,
  },
  secondaryActionText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  itemCard: {
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
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  itemMeta: {
    fontSize: 13,
    color: "#64748B",
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
