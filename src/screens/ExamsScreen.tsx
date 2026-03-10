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
import type { Course } from "../types/entities";

type ExamFilter = "all" | "upcoming" | "thisWeek" | "completed";

const FILTERS: { key: ExamFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "thisWeek", label: "This week" },
  { key: "completed", label: "Completed" },
];

const getDateKeyFromDateTime = (dateTime: string): string => {
  return dateTime.split(" ")[0] ?? "";
};

const daysBetween = (fromDateKey: string, toDateKey: string): number => {
  const from = new Date(`${fromDateKey}T00:00:00`);
  const to = new Date(`${toDateKey}T00:00:00`);
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

const pad = (value: number) => `${value}`.padStart(2, "0");

const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
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

const ExamsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { triggerCelebration } = useCelebration();
  const { grantCompletionReward } = useGamification();
  const { exams, courses, toggleExamCompletion } = useStudyData();
  const [activeFilter, setActiveFilter] = useState<ExamFilter>("all");
  const todayKey = useMemo(() => getTodayKey(), []);
  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );

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
    return exams.filter((item) => {
      if (item.status !== "upcoming") {
        return false;
      }
      const examDateKey = getDateKeyFromDateTime(item.examAt);
      const diff = daysBetween(todayKey, examDateKey);
      return diff >= 0 && diff <= 6;
    });
  }, [activeFilter, exams, todayKey]);

  const upcomingCount = exams.filter((item) => item.status === "upcoming").length;
  const completedCount = exams.length - upcomingCount;

  const onAddPressed = () => {
    navigate("examForm");
  };

  const onToggleExam = (examId: string, isCompleted: boolean, title: string) => {
    toggleExamCompletion(examId);
    if (!isCompleted) {
      grantCompletionReward({
        kind: "exam",
        sourceId: examId,
        title,
      });
      triggerCelebration({
        kind: "exam",
        title,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Exams</Text>
        <Text style={styles.title}>Track upcoming tests</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>Exam readiness</Text>
          <Text style={styles.heroTitle}>Keep revision structured and predictable</Text>
        </View>

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

        <TouchableOpacity style={styles.addButton} onPress={onAddPressed}>
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
              const course = courseMap.get(exam.courseId);
              const courseName = course?.name ?? "Unknown Course";
              const courseColor = course?.colorHex ?? DESIGN.colors.textMuted;
              const courseIconLabel = formatCourseIconLabel(course?.icon ?? "book");
              return (
                <View key={exam.id} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.titleWrap}>
                      <Text style={[styles.itemTitle, isCompleted && styles.itemTitleCompleted]}>
                        {exam.title}
                      </Text>
                      <View style={styles.courseMetaRow}>
                        <View style={[styles.courseBadge, { backgroundColor: courseColor }]}>
                          <Text style={styles.courseBadgeText}>{courseIconLabel}</Text>
                        </View>
                        <Text style={styles.itemMeta}>
                          {courseName} • {exam.examAt}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => onToggleExam(exam.id, isCompleted, exam.title)}
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
    color: DESIGN.colors.textMuted,
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
  weightPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: DESIGN.colors.accentLimeSoft,
    borderWidth: 1,
    borderColor: DESIGN.colors.accentLime,
  },
  weightText: {
    fontSize: 11,
    color: DESIGN.colors.textPrimary,
    fontWeight: "700",
  },
});

export default ExamsScreen;
