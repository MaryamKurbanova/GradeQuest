import React, { useState } from "react";
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

const SettingsScreen: React.FC = () => {
  const [displayName, setDisplayName] = useState("Guest Student");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);
  const [examReminders, setExamReminders] = useState(true);
  const [streakNudges, setStreakNudges] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [celebrationEffects, setCelebrationEffects] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(false);
  const isPremium = false;

  const handleSave = () => {
    Alert.alert("Settings saved", "Your preferences have been updated.");
  };

  const handleResetData = () => {
    Alert.alert("Reset all data?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive" },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Settings</Text>
        <Text style={styles.title}>Personalize your app</Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.label}>Display name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <Text style={styles.helperText}>No account required. This stays on your device.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <TouchableOpacity style={styles.linkRow}>
            <View>
              <Text style={styles.linkTitle}>Theme & personalization</Text>
              <Text style={styles.linkSubtitle}>Choose theme, colors, and icon style</Text>
            </View>
            <Text style={styles.linkAction}>Open</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Assignment reminders</Text>
            <Switch
              value={assignmentReminders}
              onValueChange={setAssignmentReminders}
              disabled={!notificationsEnabled}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Exam reminders</Text>
            <Switch
              value={examReminders}
              onValueChange={setExamReminders}
              disabled={!notificationsEnabled}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Streak motivational nudges</Text>
            <Switch
              value={streakNudges}
              onValueChange={setStreakNudges}
              disabled={!notificationsEnabled}
            />
          </View>
          <Text style={styles.helperText}>
            Advanced persistent reminders and custom snooze are Premium features.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Haptics</Text>
            <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Celebration effects</Text>
            <Switch value={celebrationEffects} onValueChange={setCelebrationEffects} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Premium</Text>
            <View style={[styles.planPill, isPremium ? styles.planPillPremium : styles.planPillFree]}>
              <Text style={[styles.planPillText, isPremium ? styles.planPillTextPremium : styles.planPillTextFree]}>
                {isPremium ? "Premium active" : "Free plan"}
              </Text>
            </View>
          </View>
          <Text style={styles.helperText}>
            Upgrade for unlimited calculator usage, advanced reminders, widgets, and analytics.
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Restore purchases</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>View plans</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.subtleButton}>
            <Text style={styles.subtleButtonText}>Manage subscription</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data & backup</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable cloud backup</Text>
            <Switch value={backupEnabled} onValueChange={setBackupEnabled} />
          </View>
          <Text style={styles.helperText}>
            If backup is off, deleting the app may remove your data from this device.
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
            <Text style={styles.resetButtonText}>Reset all app data</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save settings</Text>
        </TouchableOpacity>
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
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
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
  helperText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },
  linkRow: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  linkSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },
  linkAction: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  switchLabel: {
    flex: 1,
    marginRight: 10,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  planPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  planPillFree: {
    backgroundColor: "#E2E8F0",
  },
  planPillPremium: {
    backgroundColor: "#EDE9FE",
  },
  planPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  planPillTextFree: {
    color: "#334155",
  },
  planPillTextPremium: {
    color: "#6D28D9",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
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
  subtleButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  subtleButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
  },
  resetButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 10,
  },
  resetButtonText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
    marginTop: 2,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default SettingsScreen;
