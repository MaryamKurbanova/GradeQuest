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
import { useCelebration } from "../app/providers/CelebrationProvider";
import { useGamification } from "../app/providers/GamificationProvider";
import { useStudyData } from "../app/providers/StudyDataProvider";
import { DESIGN } from "../app/theme/design";
import type { Course, Priority } from "../types/entities";

type AssignmentFilter = "all" | "today" | "upcoming" | "completed";

const FILTERS: { key: AssignmentFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

const pad = (value: number) => `${value}`.padStart(2, "0");

const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const getDateKeyFromDateTime = (dateTime: string): string => {
  return dateTime.split(" ")[0] ?? "";
};

const formatPriorityLabel = (priority: Priority): "Low" | "Medium" | "High" => {
  if (priority === "high") {
    return "High";
  }
  if (priority === "medium") {
    return "Medium";
  }
  return "Low";
};

const formatCourseIconLabel = (icon: Course["icon"]): string => {
  if (icon === "book") {
    return "BOOK";
  }
  if (icon === "calculator") {
    return "MATH";
  }
  if (icon === "flask") {
    return "LAB";
  }
  if (icon === "globe") {
    return "WORLD";
  }
  return `${icon}`.slice(0, 5).toUpperCase();
};

const AssignmentsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { triggerCelebration } = useCelebration();
  const { grantCompletionReward } = useGamification();
  const { assignments, courses, toggleAssignmentCompletion } = useStudyData();
  const [activeFilter, setActiveFilter] = useState<AssignmentFilter>("all");

  const todayKey = useMemo(() => getTodayKey(), []);
  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );

  const filteredAssignments = useMemo(() => {
    if (activeFilter === "all") {
      return assignments;
    }
    if (activeFilter === "completed") {
      return assignments.filter((item) => item.status === "completed");
    }
    return assignments.filter(
      (item) =>
        item.status !== "completed" &&
        (activeFilter === "today"
          ? getDateKeyFromDateTime(item.dueAt) === todayKey
          : getDateKeyFromDateTime(item.dueAt) > todayKey),
    );
  }, [activeFilter, assignments, todayKey]);

  const pendingCount = assignments.filter((item) => item.status === "pending").length;
  const completedCount = assignments.length - pendingCount;

  const onAddPressed = () => {
    navigate("assignmentForm");
  };

  const onToggleAssignment = (assignmentId: string, isCompleted: boolean, title: string) => {
    toggleAssignmentCompletion(assignmentId);
    if (!isCompleted) {
      grantCompletionReward({
        kind: "assignment",
        sourceId: assignmentId,
        title,
      });
      triggerCelebration({
        kind: "assignment",
        title,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Assignments</Text>
        <Text style={styles.title}>Stay on top of your work</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>Task command center</Text>
          <Text style={styles.heroTitle}>Focus on what moves your grade forward</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{pendingCount}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{completedCount}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={onAddPressed}>
          <Text style={styles.addButtonText}>+ Add Assignment</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((filter) => {
            const isActive = filter.key === activeFilter;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.listContainer}>
          {filteredAssignments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyText}>
                Try switching filters or add a new assignment.
              </Text>
            </View>
          ) : (
            filteredAssignments.map((assignment) => {
              const isCompleted = assignment.status === "completed";
              const priorityLabel = formatPriorityLabel(assignment.priority);
              const course = courseMap.get(assignment.courseId);
              const courseName = course?.name ?? "Unknown Course";
              const courseColor = course?.colorHex ?? "#64748B";
              const courseIconLabel = formatCourseIconLabel(course?.icon ?? "book");
              return (
                <View key={assignment.id} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.titleWrap}>
                      <Text style={[styles.itemTitle, isCompleted && styles.itemTitleCompleted]}>
                        {assignment.title}
                      </Text>
                      <View style={styles.courseMetaRow}>
                        <View style={[styles.courseBadge, { backgroundColor: courseColor }]}>
                          <Text style={styles.courseBadgeText}>{courseIconLabel}</Text>
                        </View>
                        <Text style={styles.itemMeta}>
                          {courseName} • Due {assignment.dueAt}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        onToggleAssignment(assignment.id, isCompleted, assignment.title)
                      }
                      style={[
                        styles.statusButton,
                        isCompleted ? styles.statusButtonDone : styles.statusButtonOpen,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          isCompleted
                            ? styles.statusButtonTextDone
                            : styles.statusButtonTextOpen,
                        ]}
                      >
                        {isCompleted ? "Done" : "Mark done"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bottomRow}>
                    <View
                      style={[
                        styles.priorityPill,
                        priorityLabel === "High" && styles.priorityHigh,
                        priorityLabel === "Medium" && styles.priorityMedium,
                        priorityLabel === "Low" && styles.priorityLow,
                      ]}
                    >
                      <Text style={styles.priorityText}>{priorityLabel}</Text>
                    </View>
                  </View>
                </View>
              );
            })
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
    paddingTop: 12,
    paddingBottom: 28,
  },
  kicker: {
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
  heroCard: {
    backgroundColor: DESIGN.colors.surfaceDark,
    borderRadius: DESIGN.radius.lg,
    padding: 15,
    marginBottom: 12,
    ...DESIGN.shadow.card,
  },
  heroKicker: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#98A2B3",
    fontWeight: "700",
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 20,
    lineHeight: 26,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: DESIGN.colors.surfaceSoft,
    borderRadius: DESIGN.radius.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
    ...DESIGN.shadow.card,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: DESIGN.colors.textMuted,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: DESIGN.colors.surfaceDark,
    borderRadius: DESIGN.radius.md,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  filterRow: {
    paddingBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: DESIGN.radius.pill,
    backgroundColor: DESIGN.colors.surface,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: DESIGN.colors.surfaceDark,
  },
  filterChipText: {
    fontSize: 13,
    color: DESIGN.colors.textSecondary,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    padding: 16,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  emptyText: {
    marginTop: 4,
    fontSize: 13,
    color: DESIGN.colors.textMuted,
    textAlign: "center",
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleWrap: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
  },
  itemTitleCompleted: {
    textDecorationLine: "line-through",
    color: DESIGN.colors.textMuted,
  },
  itemMeta: {
    fontSize: 13,
    color: DESIGN.colors.textMuted,
    marginTop: 4,
  },
  courseMetaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  courseBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  courseBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statusButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusButtonOpen: {
    backgroundColor: DESIGN.colors.accentLimeSoft,
  },
  statusButtonDone: {
    backgroundColor: DESIGN.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusButtonTextOpen: {
    color: DESIGN.colors.textPrimary,
  },
  statusButtonTextDone: {
    color: DESIGN.colors.textSecondary,
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
  },
  priorityPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priorityHigh: {
    backgroundColor: "#FEE2E2",
  },
  priorityMedium: {
    backgroundColor: "#FEF3C7",
  },
  priorityLow: {
    backgroundColor: "#DCFCE7",
  },
  priorityText: {
    fontSize: 11,
    color: DESIGN.colors.textSecondary,
    fontWeight: "700",
  },
});

export default AssignmentsScreen;
