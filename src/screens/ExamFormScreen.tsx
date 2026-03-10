import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppNavigation } from "../app/navigation/NavigationContext";
import { useStudyData } from "../app/providers/StudyDataProvider";
import { DESIGN } from "../app/theme/design";

const ExamFormScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { courses, createExam } = useStudyData();
  const courseOptions = useMemo(
    () => courses.map((course) => course.name),
    [courses],
  );
  const [title, setTitle] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(courseOptions[0] ?? "");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [weightPercent, setWeightPercent] = useState("");
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [hasReminder, setHasReminder] = useState(true);

  const weightIsValid = useMemo(() => {
    const value = Number(weightPercent);
    return !Number.isNaN(value) && value >= 0 && value <= 100;
  }, [weightPercent]);

  const canSave = useMemo(() => {
    return (
      title.trim().length > 0 &&
      selectedCourse.trim().length > 0 &&
      examDate.trim().length > 0 &&
      examTime.trim().length > 0 &&
      weightPercent.trim().length > 0 &&
      weightIsValid
    );
  }, [examDate, examTime, selectedCourse, title, weightIsValid, weightPercent]);

  useEffect(() => {
    if (!selectedCourse && courseOptions.length > 0) {
      setSelectedCourse(courseOptions[0]);
    }
  }, [courseOptions, selectedCourse]);

  const resetForm = () => {
    setTitle("");
    setSelectedCourse(courseOptions[0] ?? "");
    setExamDate("");
    setExamTime("");
    setWeightPercent("");
    setRoom("");
    setNotes("");
    setHasReminder(true);
  };

  const onSave = () => {
    if (!canSave) {
      Alert.alert(
        "Missing or invalid info",
        "Please fill title, date, time, and a valid exam weight (0-100).",
      );
      return;
    }

    createExam({
      title,
      courseName: selectedCourse,
      examDate,
      examTime,
      weightPercent: Number(weightPercent),
      notes: notes.trim() || null,
    });

    Alert.alert("Exam saved", "Your exam has been added.");
    resetForm();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Exams</Text>
        <Text style={styles.title}>Create exam</Text>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Exam title</Text>
          <TextInput
            placeholder="Ex: Chemistry Unit Test"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Course</Text>
          {courseOptions.length === 0 ? (
            <View style={styles.noCourseCard}>
              <Text style={styles.noCourseTitle}>No courses found</Text>
              <Text style={styles.noCourseText}>Create a course before adding exams.</Text>
              <TouchableOpacity style={styles.noCourseButton} onPress={() => navigate("courseForm")}>
                <Text style={styles.noCourseButtonText}>Create Course</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.chipsWrap}>
              {courseOptions.map((course) => {
                const isSelected = course === selectedCourse;
                return (
                  <TouchableOpacity
                    key={course}
                    onPress={() => setSelectedCourse(course)}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {course}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldBlock, styles.half]}>
            <Text style={styles.label}>Exam date</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={examDate}
              onChangeText={setExamDate}
              style={styles.input}
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />
          </View>
          <View style={[styles.fieldBlock, styles.half]}>
            <Text style={styles.label}>Exam time</Text>
            <TextInput
              placeholder="HH:MM AM/PM"
              value={examTime}
              onChangeText={setExamTime}
              style={styles.input}
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldBlock, styles.half]}>
            <Text style={styles.label}>Weight (%)</Text>
            <TextInput
              placeholder="0 - 100"
              value={weightPercent}
              onChangeText={setWeightPercent}
              style={[styles.input, !weightIsValid && weightPercent.length > 0 && styles.inputError]}
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />
            {!weightIsValid && weightPercent.length > 0 ? (
              <Text style={styles.errorText}>Enter a value between 0 and 100.</Text>
            ) : null}
          </View>
          <View style={[styles.fieldBlock, styles.half]}>
            <Text style={styles.label}>Room (optional)</Text>
            <TextInput
              placeholder="Ex: B-204"
              value={room}
              onChangeText={setRoom}
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            placeholder="Study chapters, resources, anything important..."
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.multilineInput]}
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.reminderRow}>
          <View>
            <Text style={styles.label}>Reminder</Text>
            <Text style={styles.hint}>Get notified before this exam starts</Text>
          </View>
          <Switch value={hasReminder} onValueChange={setHasReminder} />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={onSave}
          >
            <Text style={styles.saveText}>Save Exam</Text>
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
    fontSize: 16,
    color: DESIGN.colors.textMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
    marginBottom: 18,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: DESIGN.colors.textMuted,
    marginTop: 2,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: DESIGN.colors.textPrimary,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
  },
  inputError: {
    borderColor: DESIGN.colors.danger,
  },
  errorText: {
    marginTop: 6,
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "500",
  },
  multilineInput: {
    minHeight: 96,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: DESIGN.colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: DESIGN.colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: DESIGN.colors.textSecondary,
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  noCourseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    padding: 12,
  },
  noCourseTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  noCourseText: {
    marginTop: 4,
    fontSize: 12,
    color: DESIGN.colors.textMuted,
  },
  noCourseButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: DESIGN.colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  noCourseButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  half: {
    width: "48.5%",
  },
  reminderRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: "row",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: DESIGN.colors.border,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 6,
  },
  cancelText: {
    color: DESIGN.colors.textPrimary,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1.5,
    backgroundColor: DESIGN.colors.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginLeft: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#A5B4FC",
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default ExamFormScreen;
