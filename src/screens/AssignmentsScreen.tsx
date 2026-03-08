import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AssignmentStatus = "pending" | "completed";
type AssignmentFilter = "all" | "today" | "upcoming" | "completed";

type Assignment = {
  id: string;
  title: string;
  course: string;
  dueLabel: string;
  dueGroup: "today" | "upcoming";
  priority: "Low" | "Medium" | "High";
  status: AssignmentStatus;
};

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "a-1",
    title: "Solve quadratic practice set",
    course: "Algebra II",
    dueLabel: "Today, 5:00 PM",
    dueGroup: "today",
    priority: "High",
    status: "pending",
  },
  {
    id: "a-2",
    title: "Read chapter 6 and notes",
    course: "Biology",
    dueLabel: "Today, 8:00 PM",
    dueGroup: "today",
    priority: "Medium",
    status: "pending",
  },
  {
    id: "a-3",
    title: "Outline essay introduction",
    course: "English",
    dueLabel: "Mon, Mar 9",
    dueGroup: "upcoming",
    priority: "Medium",
    status: "pending",
  },
  {
    id: "a-4",
    title: "Flashcards review",
    course: "World History",
    dueLabel: "Sun, Mar 8",
    dueGroup: "today",
    priority: "Low",
    status: "completed",
  },
];

const FILTERS: { key: AssignmentFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

const AssignmentsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<AssignmentFilter>("all");
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);

  const filteredAssignments = useMemo(() => {
    if (activeFilter === "all") {
      return assignments;
    }
    if (activeFilter === "completed") {
      return assignments.filter((item) => item.status === "completed");
    }
    return assignments.filter(
      (item) => item.status !== "completed" && item.dueGroup === activeFilter,
    );
  }, [activeFilter, assignments]);

  const pendingCount = assignments.filter((item) => item.status === "pending").length;
  const completedCount = assignments.length - pendingCount;

  const toggleCompleted = (id: string) => {
    setAssignments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "completed" ? "pending" : "completed" }
          : item,
      ),
    );
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

        <TouchableOpacity style={styles.addButton}>
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
              return (
                <View key={assignment.id} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.titleWrap}>
                      <Text style={[styles.itemTitle, isCompleted && styles.itemTitleCompleted]}>
                        {assignment.title}
                      </Text>
                      <Text style={styles.itemMeta}>
                        {assignment.course} - Due {assignment.dueLabel}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleCompleted(assignment.id)}
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
                        assignment.priority === "High" && styles.priorityHigh,
                        assignment.priority === "Medium" && styles.priorityMedium,
                        assignment.priority === "Low" && styles.priorityLow,
                      ]}
                    >
                      <Text style={styles.priorityText}>{assignment.priority}</Text>
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
    fontSize: 28,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 16,
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
    marginTop: 10,
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
