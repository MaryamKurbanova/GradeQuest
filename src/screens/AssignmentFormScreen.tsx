import React, { useMemo, useState } from "react";
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

type Priority = "Low" | "Medium" | "High";

const COURSE_OPTIONS = ["Algebra II", "Biology", "English", "World History"];
const PRIORITY_OPTIONS: Priority[] = ["Low", "Medium", "High"];

const AssignmentFormScreen: React.FC = () => {
  const [title, setTitle] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(COURSE_OPTIONS[0]);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [notes, setNotes] = useState("");
  const [hasReminder, setHasReminder] = useState(true);

  const canSave = useMemo(() => {
    return title.trim().length > 0 && dueDate.trim().length > 0 && dueTime.trim().length > 0;
  }, [dueDate, dueTime, title]);

  const resetForm = () => {
    setTitle("");
    setSelectedCourse(COURSE_OPTIONS[0]);
    setDueDate("");
    setDueTime("");
    setPriority("Medium");
    setNotes("");
    setHasReminder(true);
  };

  const onSave = () => {
    if (!canSave) {
      Alert.alert("Missing info", "Please add title, due date, and due time.");
      return;
    }

    Alert.alert("Assignment saved", "Your assignment has been added.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Assignments</Text>
        <Text style={styles.title}>Create assignment</Text>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="Ex: Math worksheet"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Course</Text>
          <View style={styles.chipsWrap}>
            {COURSE_OPTIONS.map((course) => {
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
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldBlock, styles.half]}>
            <Text style={styles.label}>Due date</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
              style={styles.input}
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />
          </View>
          <View style={[styles.fieldBlock, styles.half]}>
            <Text style={styles.label}>Due time</Text>
            <TextInput
              placeholder="HH:MM AM/PM"
              value={dueTime}
              onChangeText={setDueTime}
              style={styles.input}
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipsWrap}>
            {PRIORITY_OPTIONS.map((option) => {
              const isSelected = option === priority;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setPriority(option)}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            placeholder="Any details for this assignment..."
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
            <Text style={styles.hint}>Get a notification before due time</Text>
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
            <Text style={styles.saveText}>Save Assignment</Text>
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
    marginBottom: 18,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
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
    backgroundColor: "#E2E8F0",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#1D4ED8",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  chipTextSelected: {
    color: "#FFFFFF",
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
    borderColor: "#E2E8F0",
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
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 6,
  },
  cancelText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1.5,
    backgroundColor: "#4F46E5",
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

export default AssignmentFormScreen;
