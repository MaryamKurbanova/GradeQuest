import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppSettings } from "../app/providers/AppSettingsProvider";

type Assignment = {
  id: string;
  title: string;
  course: string;
  dueTime: string;
  isOverdue?: boolean;
};

type Exam = {
  id: string;
  title: string;
  course: string;
  examDate: string;
};

const TODAY_ASSIGNMENTS: Assignment[] = [
  { id: "a1", title: "Math worksheet", course: "Algebra II", dueTime: "3:00 PM" },
  { id: "a2", title: "Read chapter 5", course: "Biology", dueTime: "6:00 PM" },
  { id: "a3", title: "Essay outline", course: "English", dueTime: "Yesterday", isOverdue: true },
];

const UPCOMING_EXAMS: Exam[] = [
  { id: "e1", title: "Unit 4 Test", course: "Chemistry", examDate: "Mar 11" },
  { id: "e2", title: "Midterm", course: "World History", examDate: "Mar 14" },
];

const DashboardScreen: React.FC = () => {
  const { displayName } = useAppSettings();
  const points = 240;
  const streakDays = 4;
  const level = 3;

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
          <TouchableOpacity style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>+ Add Assignment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>+ Add Exam</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's assignments</Text>
          {TODAY_ASSIGNMENTS.map((assignment) => (
            <View key={assignment.id} style={styles.itemCard}>
              <View style={styles.itemTopRow}>
                <Text style={styles.itemTitle}>{assignment.title}</Text>
                {assignment.isOverdue ? (
                  <View style={styles.overduePill}>
                    <Text style={styles.overdueText}>Overdue</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.itemMeta}>
                {assignment.course} - Due {assignment.dueTime}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming exams</Text>
          {UPCOMING_EXAMS.map((exam) => (
            <View key={exam.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{exam.title}</Text>
              <Text style={styles.itemMeta}>
                {exam.course} - {exam.examDate}
              </Text>
            </View>
          ))}
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
