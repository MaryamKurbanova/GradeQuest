import React, { useMemo, useState } from "react";
import {
  Alert,
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
import type { Assignment, Exam } from "../types/entities";

type TaskFilter = "all" | "open" | "completed";
type TaskKind = "assignment" | "exam";

type TaskItem = {
  key: string;
  id: string;
  kind: TaskKind;
  title: string;
  scheduledAt: string;
  courseName: string;
  courseColor: string;
  status: "open" | "completed";
  priorityLabel?: "Low" | "Medium" | "High";
  weightPercent?: number;
};

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "completed", label: "Completed" },
];

const formatPriorityLabel = (priority: Assignment["priority"]): "Low" | "Medium" | "High" => {
  if (priority === "high") {
    return "High";
  }
  if (priority === "medium") {
    return "Medium";
  }
  return "Low";
};

const AssignmentsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { triggerCelebration } = useCelebration();
  const { grantCompletionReward } = useGamification();
  const {
    assignments,
    exams,
    courses,
    toggleAssignmentCompletion,
    deleteAssignment,
    toggleExamCompletion,
    deleteExam,
  } = useStudyData();
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");

  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  const allTasks = useMemo<TaskItem[]>(() => {
    const assignmentTasks: TaskItem[] = assignments.map((assignment) => {
      const course = courseMap.get(assignment.courseId);
      return {
        key: `assignment:${assignment.id}`,
        id: assignment.id,
        kind: "assignment",
        title: assignment.title,
        scheduledAt: assignment.dueAt,
        courseName: course?.name ?? "Unknown Course",
        courseColor: course?.colorHex ?? DESIGN.colors.textMuted,
        status: assignment.status === "completed" ? "completed" : "open",
        priorityLabel: formatPriorityLabel(assignment.priority),
      };
    });

    const examTasks: TaskItem[] = exams.map((exam) => {
      const course = courseMap.get(exam.courseId);
      return {
        key: `exam:${exam.id}`,
        id: exam.id,
        kind: "exam",
        title: exam.title,
        scheduledAt: exam.examAt,
        courseName: course?.name ?? "Unknown Course",
        courseColor: course?.colorHex ?? DESIGN.colors.textMuted,
        status: exam.status === "completed" ? "completed" : "open",
        weightPercent: exam.weightPercent,
      };
    });

    return [...assignmentTasks, ...examTasks].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [assignments, exams, courseMap]);

  const filteredTasks = useMemo(() => {
    if (activeFilter === "all") {
      return allTasks;
    }
    return allTasks.filter((task) => task.status === activeFilter);
  }, [activeFilter, allTasks]);

  const openCount = allTasks.filter((task) => task.status === "open").length;
  const completedCount = allTasks.length - openCount;

  const handleToggleTask = (task: TaskItem) => {
    const willComplete = task.status !== "completed";
    if (task.kind === "assignment") {
      toggleAssignmentCompletion(task.id);
      if (willComplete) {
        grantCompletionReward({ kind: "assignment", sourceId: task.id, title: task.title });
        triggerCelebration({ kind: "assignment", title: task.title });
      }
      return;
    }

    toggleExamCompletion(task.id);
    if (willComplete) {
      grantCompletionReward({ kind: "exam", sourceId: task.id, title: task.title });
      triggerCelebration({ kind: "exam", title: task.title });
    }
  };

  const handleDeleteTask = (task: TaskItem) => {
    const label = task.kind === "exam" ? "exam" : "task";
    Alert.alert(`Delete ${label}?`, `Delete "${task.title}" permanently?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          try {
            if (task.kind === "assignment") {
              deleteAssignment(task.id);
            } else {
              deleteExam(task.id);
            }
          } catch (error) {
            Alert.alert(
              "Unable to delete",
              error instanceof Error ? error.message : "Please try again.",
            );
          }
        },
      },
    ]);
  };

  const onManageTask = (task: TaskItem) => {
    Alert.alert(task.title, "Choose an action", [
      { text: "Cancel", style: "cancel" },
      {
        text: task.status === "completed" ? "Mark as open" : "Mark as done",
        onPress: () => handleToggleTask(task),
      },
      { text: "Delete", style: "destructive", onPress: () => handleDeleteTask(task) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Tasks</Text>
        <Text style={styles.title}>Everything in one place</Text>
        <Text style={styles.meta}>
          {openCount} open • {completedCount} completed
        </Text>

        <View style={styles.addRow}>
          <TouchableOpacity style={styles.addButton} onPress={() => navigate("assignmentForm")}>
            <Text style={styles.addButtonText}>+ Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonLast]}
            onPress={() => navigate("examForm")}
          >
            <Text style={styles.addButtonText}>+ Exam</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
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
        </View>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyText}>Add an assignment or exam to get started.</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <View key={task.key} style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <View style={[styles.colorDot, { backgroundColor: task.courseColor }]} />
                <View style={styles.itemTextWrap}>
                  <Text style={[styles.itemTitle, task.status === "completed" && styles.itemTitleCompleted]}>
                    {task.title}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {task.kind === "exam" ? "Exam" : "Assignment"} • {task.courseName} •{" "}
                    {task.scheduledAt}
                    {task.priorityLabel ? ` • ${task.priorityLabel}` : ""}
                    {typeof task.weightPercent === "number" ? ` • ${task.weightPercent}%` : ""}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.manageButton} onPress={() => onManageTask(task)}>
                <Text style={styles.manageButtonText}>{task.status === "completed" ? "Done" : "Manage"}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
    fontSize: 13,
    color: DESIGN.colors.textMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  meta: {
    marginTop: 5,
    fontSize: 13,
    color: DESIGN.colors.textMuted,
    marginBottom: 14,
  },
  addRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: DESIGN.colors.surface,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.radius.md,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8,
  },
  addButtonLast: {
    marginRight: 0,
  },
  addButtonText: {
    color: DESIGN.colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: DESIGN.radius.pill,
    backgroundColor: DESIGN.colors.surface,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: DESIGN.colors.primarySoft,
    borderColor: DESIGN.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: DESIGN.colors.textSecondary,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: DESIGN.colors.textPrimary,
    fontWeight: "700",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: DESIGN.radius.pill,
    marginRight: 9,
  },
  itemTextWrap: {
    flex: 1,
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
    fontSize: 12,
    color: DESIGN.colors.textMuted,
    marginTop: 3,
  },
  manageButton: {
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    backgroundColor: DESIGN.colors.surfaceSoft,
    borderRadius: DESIGN.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  manageButtonText: {
    fontSize: 11,
    color: DESIGN.colors.textSecondary,
    fontWeight: "700",
  },
});

export default AssignmentsScreen;
