import React, { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppNavigation } from "../app/navigation/NavigationContext";
import { useStudyData } from "../app/providers/StudyDataProvider";
import type { Course } from "../types/entities";

const ICON_OPTIONS = ["book", "calculator", "flask", "globe"];
const COLOR_OPTIONS = ["#6366F1", "#22C55E", "#0EA5E9", "#F97316", "#E11D48", "#8B5CF6"];

const toIconLabel = (icon: Course["icon"]): string => {
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

const CoursesScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { courses, assignments, exams, updateCourse, deleteCourse } = useStudyData();
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftColorHex, setDraftColorHex] = useState("#6366F1");
  const [draftIcon, setDraftIcon] = useState("book");

  const usageMap = useMemo(() => {
    const map = new Map<string, { assignments: number; exams: number }>();
    courses.forEach((course) => {
      map.set(course.id, { assignments: 0, exams: 0 });
    });

    assignments.forEach((assignment) => {
      const current = map.get(assignment.courseId) ?? { assignments: 0, exams: 0 };
      map.set(assignment.courseId, {
        assignments: current.assignments + 1,
        exams: current.exams,
      });
    });

    exams.forEach((exam) => {
      const current = map.get(exam.courseId) ?? { assignments: 0, exams: 0 };
      map.set(exam.courseId, {
        assignments: current.assignments,
        exams: current.exams + 1,
      });
    });

    return map;
  }, [assignments, courses, exams]);

  const startEditing = (course: Course) => {
    setEditingCourseId(course.id);
    setDraftName(course.name);
    setDraftColorHex(course.colorHex);
    setDraftIcon(course.icon);
  };

  const onCancelEditing = () => {
    setEditingCourseId(null);
    setDraftName("");
    setDraftColorHex("#6366F1");
    setDraftIcon("book");
  };

  const onSaveEditing = () => {
    if (!editingCourseId) {
      return;
    }

    try {
      updateCourse(editingCourseId, {
        name: draftName,
        colorHex: draftColorHex,
        icon: draftIcon,
      });
      onCancelEditing();
    } catch (error) {
      Alert.alert("Unable to update", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const onDeleteCourse = (course: Course) => {
    Alert.alert("Delete course?", `Delete "${course.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          try {
            deleteCourse(course.id);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Courses</Text>
        <Text style={styles.title}>Manage your classes</Text>

        <TouchableOpacity style={styles.addButton} onPress={() => navigate("courseForm")}>
          <Text style={styles.addButtonText}>+ Add Course</Text>
        </TouchableOpacity>

        {courses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No courses yet</Text>
            <Text style={styles.emptyText}>Create your first course to start planning tasks.</Text>
          </View>
        ) : null}

        {courses.map((course) => {
          const usage = usageMap.get(course.id) ?? { assignments: 0, exams: 0 };
          const isEditing = course.id === editingCourseId;
          return (
            <View key={course.id} style={styles.itemCard}>
              {isEditing ? (
                <>
                  <Text style={styles.label}>Course name</Text>
                  <TextInput
                    value={draftName}
                    onChangeText={setDraftName}
                    placeholder="Course name"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                  />

                  <Text style={styles.label}>Color</Text>
                  <View style={styles.colorRow}>
                    {COLOR_OPTIONS.map((color) => {
                      const isSelected = draftColorHex === color;
                      return (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorCircle,
                            { backgroundColor: color },
                            isSelected && styles.colorCircleSelected,
                          ]}
                          onPress={() => setDraftColorHex(color)}
                        />
                      );
                    })}
                  </View>

                  <Text style={styles.label}>Icon style</Text>
                  <View style={styles.iconRow}>
                    {ICON_OPTIONS.map((icon) => {
                      const isSelected = draftIcon === icon;
                      return (
                        <TouchableOpacity
                          key={icon}
                          style={[styles.iconChip, isSelected && styles.iconChipSelected]}
                          onPress={() => setDraftIcon(icon)}
                        >
                          <Text style={[styles.iconChipText, isSelected && styles.iconChipTextSelected]}>
                            {toIconLabel(icon)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={onCancelEditing}>
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryButton} onPress={onSaveEditing}>
                      <Text style={styles.primaryButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.courseHeader}>
                    <View style={[styles.badge, { backgroundColor: course.colorHex }]}>
                      <Text style={styles.badgeText}>{toIconLabel(course.icon)}</Text>
                    </View>
                    <View style={styles.courseHeaderText}>
                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseMeta}>
                        {usage.assignments} assignment{usage.assignments === 1 ? "" : "s"} •{" "}
                        {usage.exams} exam{usage.exams === 1 ? "" : "s"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => startEditing(course)}>
                      <Text style={styles.secondaryButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.secondaryButton, styles.deleteButton]}
                      onPress={() => onDeleteCourse(course)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          );
        })}
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
    marginBottom: 14,
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
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
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
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  courseHeaderText: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  courseMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 7,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: "#0F172A",
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  iconChip: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  iconChipSelected: {
    backgroundColor: "#1D4ED8",
  },
  iconChipText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
  },
  iconChipTextSelected: {
    color: "#FFFFFF",
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: "row",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 6,
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
  },
  deleteButton: {
    marginRight: 0,
    marginLeft: 6,
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginLeft: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default CoursesScreen;
