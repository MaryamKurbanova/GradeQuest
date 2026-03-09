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
    fontSize: 25,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  filterRow: {
    paddingBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#1D4ED8",
  },
  filterChipText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyText: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 9,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  itemTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#64748B",
  },
  itemMeta: {
    fontSize: 13,
    color: "#64748B",
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
    backgroundColor: "#EEF2FF",
  },
  statusButtonDone: {
    backgroundColor: "#DCFCE7",
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusButtonTextOpen: {
    color: "#3730A3",
  },
  statusButtonTextDone: {
    color: "#166534",
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
    color: "#334155",
    fontWeight: "700",
  },
});

export default AssignmentsScreen;
