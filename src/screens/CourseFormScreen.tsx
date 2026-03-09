import React, { useState } from "react";
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

import { DESIGN } from "../app/theme/design";
import { useAppNavigation } from "../app/navigation/NavigationContext";
import { useStudyData } from "../app/providers/StudyDataProvider";

const ICON_OPTIONS = ["book", "calculator", "flask", "globe"];
const COLOR_OPTIONS = ["#6366F1", "#22C55E", "#0EA5E9", "#F97316", "#E11D48", "#8B5CF6"];

const toIconLabel = (icon: string): string => {
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
  return icon.toUpperCase();
};

const CourseFormScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { createCourse } = useStudyData();
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState("#6366F1");
  const [icon, setIcon] = useState("book");

  const onSave = () => {
    if (!name.trim()) {
      Alert.alert("Missing info", "Please enter a course name.");
      return;
    }

    try {
      createCourse({
        name,
        colorHex,
        icon,
      });
      Alert.alert("Course saved", "Your course has been added.");
      navigate("courses");
    } catch (error) {
      Alert.alert("Unable to save", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Courses</Text>
        <Text style={styles.title}>Create course</Text>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Course name</Text>
          <TextInput
            placeholder="Ex: Physics"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((color) => {
              const isSelected = colorHex === color;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    isSelected && styles.colorCircleSelected,
                  ]}
                  onPress={() => setColorHex(color)}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Icon style</Text>
          <View style={styles.iconRow}>
            {ICON_OPTIONS.map((item) => {
              const isSelected = icon === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.iconChip, isSelected && styles.iconChipSelected]}
                  onPress={() => setIcon(item)}
                >
                  <Text style={[styles.iconChipText, isSelected && styles.iconChipTextSelected]}>
                    {toIconLabel(item)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigate("courses")}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveText}>Save Course</Text>
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
    color: DESIGN.colors.textPrimary,
    marginBottom: 8,
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
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 999,
    marginRight: 10,
    marginBottom: 10,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: DESIGN.colors.textPrimary,
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  iconChip: {
    backgroundColor: DESIGN.colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  iconChipSelected: {
    backgroundColor: DESIGN.colors.primary,
  },
  iconChipText: {
    fontSize: 12,
    color: DESIGN.colors.textSecondary,
    fontWeight: "700",
  },
  iconChipTextSelected: {
    color: "#FFFFFF",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 6,
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
  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default CourseFormScreen;
