import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type EventType = "assignment" | "exam";
type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

type CalendarEvent = {
  id: string;
  title: string;
  course: string;
  timeLabel: string;
  type: EventType;
  day: DayKey;
};

const WEEK_DAYS: { key: DayKey; shortLabel: string; dateLabel: string }[] = [
  { key: "sun", shortLabel: "Sun", dateLabel: "8" },
  { key: "mon", shortLabel: "Mon", dateLabel: "9" },
  { key: "tue", shortLabel: "Tue", dateLabel: "10" },
  { key: "wed", shortLabel: "Wed", dateLabel: "11" },
  { key: "thu", shortLabel: "Thu", dateLabel: "12" },
  { key: "fri", shortLabel: "Fri", dateLabel: "13" },
  { key: "sat", shortLabel: "Sat", dateLabel: "14" },
];

const EVENTS: CalendarEvent[] = [
  {
    id: "ev-1",
    title: "Math worksheet",
    course: "Algebra II",
    timeLabel: "3:00 PM",
    type: "assignment",
    day: "sun",
  },
  {
    id: "ev-2",
    title: "Biology chapter review",
    course: "Biology",
    timeLabel: "6:00 PM",
    type: "assignment",
    day: "sun",
  },
  {
    id: "ev-3",
    title: "Calculus Quiz 3",
    course: "Calculus",
    timeLabel: "10:00 AM",
    type: "exam",
    day: "tue",
  },
  {
    id: "ev-4",
    title: "Chemistry Unit Test",
    course: "Chemistry",
    timeLabel: "1:30 PM",
    type: "exam",
    day: "thu",
  },
];

const CalendarScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<DayKey>("sun");

  const selectedDayEvents = useMemo(
    () => EVENTS.filter((event) => event.day === selectedDay),
    [selectedDay],
  );

  const selectedDayMeta = WEEK_DAYS.find((day) => day.key === selectedDay);
  const assignmentCount = selectedDayEvents.filter((event) => event.type === "assignment").length;
  const examCount = selectedDayEvents.filter((event) => event.type === "exam").length;

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
          {WEEK_DAYS.map((day) => {
            const isSelected = day.key === selectedDay;
            return (
              <TouchableOpacity
                key={day.key}
                style={[styles.dayCard, isSelected && styles.dayCardSelected]}
                onPress={() => setSelectedDay(day.key)}
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
                  <Text style={styles.itemMeta}>
                    {event.course} • {event.timeLabel}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>+ Add Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction}>
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
  dayRow: {
    paddingBottom: 6,
  },
  dayCard: {
    width: 64,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8,
  },
  dayCardSelected: {
    backgroundColor: "#1D4ED8",
  },
  dayShort: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  dayShortSelected: {
    color: "#DBEAFE",
  },
  dayDate: {
    marginTop: 4,
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "700",
  },
  dayDateSelected: {
    color: "#FFFFFF",
  },
  summaryCard: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  summaryText: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
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
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginRight: 10,
    flex: 1,
  },
  itemMeta: {
    fontSize: 13,
    color: "#64748B",
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
});

export default CalendarScreen;
