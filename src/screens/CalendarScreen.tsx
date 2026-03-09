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
import { useStudyData } from "../app/providers/StudyDataProvider";
import { DESIGN } from "../app/theme/design";
import type { Course } from "../types/entities";
import {
  addDays,
  extractDateKey,
  formatShortTimeLabel,
  getStartOfWeek,
  getTodayDateKey,
  toDateKey,
} from "../utils/date";

type EventType = "assignment" | "exam";

type CalendarEvent = {
  id: string;
  title: string;
  courseName: string;
  courseColor: string;
  courseIcon: string;
  timeLabel: string;
  type: EventType;
  dateKey: string;
  isCompleted: boolean;
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

const CalendarScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { assignments, exams, courses } = useStudyData();
  const todayKey = getTodayDateKey();

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) => {
        const date = addDays(getStartOfWeek(new Date()), index);
        return {
          key: toDateKey(date),
          shortLabel: date.toLocaleDateString(undefined, { weekday: "short" }),
          dateLabel: `${date.getDate()}`,
        };
      }),
    [],
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );

  const events = useMemo<CalendarEvent[]>(() => {
    const assignmentEvents = assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      courseName: courseMap.get(assignment.courseId)?.name ?? "Unknown Course",
      courseColor: courseMap.get(assignment.courseId)?.colorHex ?? "#64748B",
      courseIcon: formatCourseIconLabel(courseMap.get(assignment.courseId)?.icon ?? "book"),
      timeLabel: formatShortTimeLabel(assignment.dueAt),
      type: "assignment" as const,
      dateKey: extractDateKey(assignment.dueAt),
      isCompleted: assignment.status === "completed",
    }));

    const examEvents = exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      courseName: courseMap.get(exam.courseId)?.name ?? "Unknown Course",
      courseColor: courseMap.get(exam.courseId)?.colorHex ?? "#64748B",
      courseIcon: formatCourseIconLabel(courseMap.get(exam.courseId)?.icon ?? "book"),
      timeLabel: formatShortTimeLabel(exam.examAt),
      type: "exam" as const,
      dateKey: extractDateKey(exam.examAt),
      isCompleted: exam.status === "completed",
    }));

    return [...assignmentEvents, ...examEvents].filter((event) => event.dateKey.length > 0);
  }, [assignments, exams, courseMap]);

  const selectedDayEvents = useMemo(
    () =>
      events
        .filter((event) => event.dateKey === selectedDateKey)
        .sort((a, b) => a.timeLabel.localeCompare(b.timeLabel)),
    [events, selectedDateKey],
  );

  const selectedDayMeta = weekDays.find((day) => day.key === selectedDateKey);
  const assignmentCount = selectedDayEvents.filter((event) => event.type === "assignment").length;
  const examCount = selectedDayEvents.filter((event) => event.type === "exam").length;

  const onAddAssignment = () => {
    navigate("assignmentForm");
  };

  const onAddExam = () => {
    navigate("examForm");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Calendar</Text>
        <Text style={styles.title}>Plan your week</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayRow}
        >
          {weekDays.map((day) => {
            const isSelected = day.key === selectedDateKey;
            return (
              <TouchableOpacity
                key={day.key}
                style={[styles.dayCard, isSelected && styles.dayCardSelected]}
                onPress={() => setSelectedDateKey(day.key)}
              >
                <Text style={[styles.dayShort, isSelected && styles.dayShortSelected]}>
                  {day.shortLabel}
                </Text>
                <Text style={[styles.dayDate, isSelected && styles.dayDateSelected]}>
                  {day.dateLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {selectedDayMeta?.shortLabel} {selectedDayMeta?.dateLabel} schedule
          </Text>
          <Text style={styles.summaryText}>
            {assignmentCount} assignment{assignmentCount === 1 ? "" : "s"} • {examCount} exam
            {examCount === 1 ? "" : "s"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agenda</Text>
          {selectedDayEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No events for this day</Text>
              <Text style={styles.emptyText}>Enjoy the break or add a new task.</Text>
            </View>
          ) : (
            selectedDayEvents.map((event) => {
              const isExam = event.type === "exam";
              return (
                <View key={event.id} style={styles.itemCard}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemTitle}>{event.title}</Text>
                    <View style={[styles.typePill, isExam ? styles.examPill : styles.assignmentPill]}>
                      <Text style={[styles.typeText, isExam ? styles.examText : styles.assignmentText]}>
                        {isExam ? "Exam" : "Assignment"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemMeta}>
                    <View style={[styles.courseBadge, { backgroundColor: event.courseColor }]}>
                      <Text style={styles.courseBadgeText}>{event.courseIcon}</Text>
                    </View>
                    <Text style={styles.itemMetaText}>
                      {event.courseName} • {event.timeLabel}
                      {event.isCompleted ? " • Completed" : ""}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.primaryAction} onPress={onAddAssignment}>
            <Text style={styles.primaryActionText}>+ Add Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={onAddExam}>
            <Text style={styles.secondaryActionText}>+ Add Exam</Text>
          </TouchableOpacity>
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
    fontSize: 25,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
    marginBottom: 14,
  },
  dayRow: {
    paddingBottom: 6,
  },
  dayCard: {
    width: 64,
    borderRadius: DESIGN.radius.md,
    backgroundColor: DESIGN.colors.surface,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8,
  },
  dayCardSelected: {
    backgroundColor: DESIGN.colors.primary,
  },
  dayShort: {
    fontSize: 12,
    color: DESIGN.colors.textSecondary,
    fontWeight: "600",
  },
  dayShortSelected: {
    color: "#DBEAFE",
  },
  dayDate: {
    marginTop: 4,
    fontSize: 18,
    color: DESIGN.colors.textPrimary,
    fontWeight: "700",
  },
  dayDateSelected: {
    color: "#FFFFFF",
  },
  summaryCard: {
    marginTop: 10,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
    padding: 14,
    ...DESIGN.shadow.card,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  summaryText: {
    marginTop: 4,
    fontSize: 13,
    color: DESIGN.colors.textMuted,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
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
    color: "#64748B",
  },
  itemCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
    padding: 12,
    marginBottom: 9,
    ...DESIGN.shadow.card,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
    marginRight: 10,
    flex: 1,
  },
  itemMeta: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  itemMetaText: {
    fontSize: 13,
    color: DESIGN.colors.textMuted,
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
  typePill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  assignmentPill: {
    backgroundColor: "#DCFCE7",
  },
  examPill: {
    backgroundColor: "#E0E7FF",
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  assignmentText: {
    color: "#166534",
  },
  examText: {
    color: "#3730A3",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: DESIGN.colors.primary,
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
    backgroundColor: DESIGN.colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 6,
  },
  secondaryActionText: {
    color: DESIGN.colors.textPrimary,
    fontWeight: "600",
  },
});

export default CalendarScreen;
