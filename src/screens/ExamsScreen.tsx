import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ExamStatus = "upcoming" | "completed";
type ExamFilter = "all" | "upcoming" | "thisWeek" | "completed";

type Exam = {
  id: string;
  title: string;
  course: string;
  examDateLabel: string;
  dueGroup: "thisWeek" | "later";
  weightPercent: number;
  status: ExamStatus;
};

const INITIAL_EXAMS: Exam[] = [
  {
    id: "e-1",
    title: "Calculus Quiz 3",
    course: "Calculus",
    examDateLabel: "Tue, Mar 10 - 10:00 AM",
    dueGroup: "thisWeek",
    weightPercent: 15,
    status: "upcoming",
  },
  {
    id: "e-2",
    title: "Chemistry Unit Test",
    course: "Chemistry",
    examDateLabel: "Thu, Mar 12 - 1:30 PM",
    dueGroup: "thisWeek",
    weightPercent: 25,
    status: "upcoming",
  },
  {
    id: "e-3",
    title: "History Midterm",
    course: "World History",
    examDateLabel: "Mon, Mar 16 - 9:00 AM",
    dueGroup: "later",
    weightPercent: 30,
    status: "upcoming",
  },
  {
    id: "e-4",
    title: "Biology Pop Quiz",
    course: "Biology",
    examDateLabel: "Sat, Mar 7 - 2:00 PM",
    dueGroup: "thisWeek",
    weightPercent: 10,
    status: "completed",
  },
];

const FILTERS: { key: ExamFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "thisWeek", label: "This week" },
  { key: "completed", label: "Completed" },
];

const ExamsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<ExamFilter>("all");
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);

  const filteredExams = useMemo(() => {
    if (activeFilter === "all") {
      return exams;
    }
    if (activeFilter === "upcoming") {
      return exams.filter((item) => item.status === "upcoming");
    }
    if (activeFilter === "completed") {
      return exams.filter((item) => item.status === "completed");
    }
    return exams.filter((item) => item.status === "upcoming" && item.dueGroup === "thisWeek");
  }, [activeFilter, exams]);

  const upcomingCount = exams.filter((item) => item.status === "upcoming").length;
  const completedCount = exams.length - upcomingCount;

  const toggleCompleted = (id: string) => {
    setExams((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "completed" ? "upcoming" : "completed" }
          : item,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Exams</Text>
        <Text style={styles.title}>Track upcoming tests</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{upcomingCount}</Text>
            <Text style={styles.summaryLabel}>Upcoming</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{completedCount}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Exam</Text>
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
          {filteredExams.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No exams in this view</Text>
              <Text style={styles.emptyText}>Add an exam or switch to another filter.</Text>
            </View>
          ) : (
            filteredExams.map((exam) => {
              const isCompleted = exam.status === "completed";
              return (
                <View key={exam.id} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.titleWrap}>
                      <Text style={[styles.itemTitle, isCompleted && styles.itemTitleCompleted]}>
                        {exam.title}
                      </Text>
                      <Text style={styles.itemMeta}>
                        {exam.course} - {exam.examDateLabel}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleCompleted(exam.id)}
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
                    <View style={styles.weightPill}>
                      <Text style={styles.weightText}>Weight {exam.weightPercent}%</Text>
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
  weightPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#E0E7FF",
  },
  weightText: {
    fontSize: 11,
    color: "#3730A3",
    fontWeight: "700",
  },
});

export default ExamsScreen;
