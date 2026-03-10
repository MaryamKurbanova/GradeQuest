import React from "react";
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
import { FEATURE_FLAGS } from "../app/constants/featureFlags";
import { useAppSettings } from "../app/providers/AppSettingsProvider";
import { useNotifications } from "../app/providers/NotificationProvider";
import { useNotificationSync } from "../app/providers/NotificationSyncProvider";
import { useSubscription } from "../app/providers/SubscriptionProvider";
import { formatShortDateLabel, formatShortTimeLabel } from "../utils/date";
import { DESIGN } from "../app/theme/design";

type NudgeCadence = "daily" | "twiceDaily" | "hourly";

const NUDGE_CADENCE_OPTIONS: { key: NudgeCadence; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "twiceDaily", label: "Twice daily" },
  { key: "hourly", label: "Hourly" },
];

const SNOOZE_PRESET_OPTIONS = [10, 15, 30, 60, 120, 180];

const SettingsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const {
    displayName,
    setDisplayName,
    hapticsEnabled,
    setHapticsEnabled,
    celebrationEffectsEnabled,
    setCelebrationEffectsEnabled,
    backupEnabled,
    setBackupEnabled,
  } = useAppSettings();
  const { isPremium, isProcessing, restorePurchases, clearPremium, lastBillingMessage } =
    useSubscription();
  const { schedule, isSyncing } = useNotificationSync();
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    assignmentRemindersEnabled,
    setAssignmentRemindersEnabled,
    examRemindersEnabled,
    setExamRemindersEnabled,
    streakNudgesEnabled,
    setStreakNudgesEnabled,
    persistentRemindersEnabled,
    setPersistentRemindersEnabled,
    nudgeCadence,
    setNudgeCadence,
    snoozePresetsMinutes,
    setSnoozePresetsMinutes,
    permissionGranted,
    requestPermission,
  } = useNotifications();

  const handleSave = () => {
    Alert.alert("Settings saved", "Your preferences have been updated.");
  };

  const handleResetData = () => {
    Alert.alert("Reset all data?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive" },
    ]);
  };

  const handleRestorePurchases = () => {
    if (isPremium) {
      Alert.alert("Already active", "Premium is already active.");
      return;
    }
    void (async () => {
      const result = await restorePurchases();
      Alert.alert(result.restored ? "Restored" : "Nothing to restore", result.message);
    })();
  };

  const handleViewPlans = () => {
    navigate("paywall");
  };

  const handleManageSubscription = () => {
    if (!isPremium) {
      Alert.alert("No subscription", "You are currently on the free plan.");
      return;
    }
    Alert.alert("Manage subscription", "Manage your local subscription state on this device.", [
      { text: "Keep Premium", style: "cancel" },
      {
        text: "Switch to Free",
        style: "destructive",
        onPress: () => {
          void clearPremium();
        },
      },
    ]);
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert("Permission needed", "Enable notifications in device settings.");
        setNotificationsEnabled(false);
        return;
      }
    }

    setNotificationsEnabled(enabled);
  };

  const handleOpenThemes = () => {
    navigate("themes");
  };

  const handleOpenCourses = () => {
    navigate("courses");
  };

  const handleOpenWidgets = () => {
    if (!FEATURE_FLAGS.premiumWidgetsEnabled) {
      Alert.alert("Unavailable", "Widgets are currently disabled in this build.");
      return;
    }
    if (!isPremium) {
      navigate("paywall");
      return;
    }
    navigate("widgets");
  };

  const handlePersistentReminderToggle = (enabled: boolean) => {
    if (!isPremium) {
      navigate("paywall");
      return;
    }
    setPersistentRemindersEnabled(enabled);
  };

  const handleSelectNudgeCadence = (cadence: NudgeCadence) => {
    if (!isPremium) {
      navigate("paywall");
      return;
    }
    setNudgeCadence(cadence);
  };

  const handleToggleSnoozePreset = (minutes: number) => {
    if (!isPremium) {
      navigate("paywall");
      return;
    }

    const nextPresets = snoozePresetsMinutes.includes(minutes)
      ? snoozePresetsMinutes.filter((value) => value !== minutes)
      : [...snoozePresetsMinutes, minutes];
    setSnoozePresetsMinutes(nextPresets);
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
          <TouchableOpacity style={styles.linkRow} onPress={handleOpenThemes}>
            <View>
              <Text style={styles.linkTitle}>Theme & personalization</Text>
              <Text style={styles.linkSubtitle}>Choose theme, colors, and icon style</Text>
            </View>
            <Text style={styles.linkAction}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={handleOpenCourses}>
            <View>
              <Text style={styles.linkTitle}>Courses</Text>
              <Text style={styles.linkSubtitle}>Add and edit your course list</Text>
            </View>
            <Text style={styles.linkAction}>Open</Text>
          </TouchableOpacity>
          {FEATURE_FLAGS.premiumWidgetsEnabled ? (
            <TouchableOpacity style={styles.linkRow} onPress={handleOpenWidgets}>
              <View>
                <Text style={styles.linkTitle}>Widgets & quick access</Text>
                <Text style={styles.linkSubtitle}>
                  {isPremium
                    ? "Configure widget modules and quick add shortcuts"
                    : "Premium feature for home-screen style quick tools"}
                </Text>
              </View>
              <Text style={styles.linkAction}>{isPremium ? "Open" : "Premium"}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={(enabled) => {
                void handleNotificationsToggle(enabled);
              }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Assignment reminders</Text>
            <Switch
              value={assignmentRemindersEnabled}
              onValueChange={setAssignmentRemindersEnabled}
              disabled={!notificationsEnabled}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Exam reminders</Text>
            <Switch
              value={examRemindersEnabled}
              onValueChange={setExamRemindersEnabled}
              disabled={!notificationsEnabled}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Streak motivational nudges</Text>
            <Switch
              value={streakNudgesEnabled}
              onValueChange={setStreakNudgesEnabled}
              disabled={!notificationsEnabled}
            />
          </View>
          <Text style={styles.helperText}>
            Advanced persistent reminders and custom snooze are Premium features.
          </Text>
          <View style={styles.scheduleSummaryCard}>
            <Text style={styles.scheduleSummaryTitle}>Scheduled reminders</Text>
            <Text style={styles.scheduleSummaryMeta}>
              {isSyncing
                ? "Syncing reminder schedule..."
                : `${schedule.scheduledCount} reminder${
                    schedule.scheduledCount === 1 ? "" : "s"
                  } currently planned`}
            </Text>
            {schedule.nextReminderAt ? (
              <Text style={styles.scheduleSummaryMeta}>
                Next: {formatShortDateLabel(schedule.nextReminderAt)}{" "}
                {formatShortTimeLabel(schedule.nextReminderAt)}
              </Text>
            ) : (
              <Text style={styles.scheduleSummaryMeta}>No upcoming reminders.</Text>
            )}
          </View>
          {FEATURE_FLAGS.persistentRemindersEnabled ? (
            <View style={styles.advancedReminderBox}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Persistent reminders until complete</Text>
                <Switch
                  value={isPremium && persistentRemindersEnabled}
                  onValueChange={handlePersistentReminderToggle}
                  disabled={!notificationsEnabled}
                />
              </View>
              <Text style={styles.helperText}>
                {isPremium
                  ? "Keep reminding until tasks are marked done."
                  : "Premium required for persistent reminders and custom snooze cadence."}
              </Text>

              <Text style={styles.subsectionLabel}>Streak nudge cadence</Text>
              <View style={styles.optionRow}>
                {NUDGE_CADENCE_OPTIONS.map((option) => {
                  const isActive = nudgeCadence === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.optionChip,
                        isActive && styles.optionChipActive,
                        (!notificationsEnabled || !isPremium) && styles.optionChipDisabled,
                      ]}
                      onPress={() => handleSelectNudgeCadence(option.key)}
                      disabled={!notificationsEnabled}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isActive && styles.optionChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.subsectionLabel}>Custom snooze presets (minutes)</Text>
              <View style={styles.optionRow}>
                {SNOOZE_PRESET_OPTIONS.map((minutes) => {
                  const isSelected = snoozePresetsMinutes.includes(minutes);
                  return (
                    <TouchableOpacity
                      key={`${minutes}`}
                      style={[
                        styles.optionChip,
                        isSelected && styles.optionChipActive,
                        (!notificationsEnabled || !isPremium) && styles.optionChipDisabled,
                      ]}
                      onPress={() => handleToggleSnoozePreset(minutes)}
                      disabled={!notificationsEnabled}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          isSelected && styles.optionChipTextActive,
                        ]}
                      >
                        {minutes}m
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {!isPremium ? (
                <TouchableOpacity
                  style={styles.reminderUpgradeButton}
                  onPress={() => navigate("paywall")}
                >
                  <Text style={styles.reminderUpgradeButtonText}>Unlock advanced reminders</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
          {!permissionGranted ? (
            <Text style={styles.warningText}>
              Notification permission is off. Enable it in your device settings.
            </Text>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Haptics</Text>
            <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Celebration effects</Text>
            <Switch
              value={celebrationEffectsEnabled}
              onValueChange={setCelebrationEffectsEnabled}
            />
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
            <TouchableOpacity
              style={[styles.secondaryButton, isProcessing && styles.actionButtonDisabled]}
              onPress={handleRestorePurchases}
              disabled={isProcessing}
            >
              <Text style={styles.secondaryButtonText}>Restore purchases</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, isProcessing && styles.actionButtonDisabled]}
              onPress={handleViewPlans}
              disabled={isProcessing}
            >
              <Text style={styles.primaryButtonText}>View plans</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.subtleButton} onPress={handleManageSubscription}>
            <Text style={styles.subtleButtonText}>Manage subscription</Text>
          </TouchableOpacity>
          {lastBillingMessage ? (
            <Text style={styles.helperText}>{lastBillingMessage}</Text>
          ) : null}
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
    color: DESIGN.colors.textPrimary,
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
  helperText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: DESIGN.colors.textMuted,
  },
  warningText: {
    marginTop: 6,
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: "600",
  },
  advancedReminderBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: 12,
    padding: 12,
  },
  scheduleSummaryCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
  },
  scheduleSummaryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: DESIGN.colors.textSecondary,
    marginBottom: 2,
  },
  scheduleSummaryMeta: {
    fontSize: 12,
    color: DESIGN.colors.textMuted,
    lineHeight: 17,
  },
  subsectionLabel: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "700",
    color: DESIGN.colors.textSecondary,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  optionChip: {
    backgroundColor: DESIGN.colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipActive: {
    backgroundColor: DESIGN.colors.primary,
  },
  optionChipDisabled: {
    opacity: 0.55,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: DESIGN.colors.textSecondary,
  },
  optionChipTextActive: {
    color: "#FFFFFF",
  },
  reminderUpgradeButton: {
    marginTop: 4,
    backgroundColor: DESIGN.colors.primarySoft,
    borderRadius: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  reminderUpgradeButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: DESIGN.colors.primary,
  },
  linkRow: {
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  linkSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: DESIGN.colors.textMuted,
  },
  linkAction: {
    fontSize: 12,
    fontWeight: "700",
    color: DESIGN.colors.primary,
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
    color: DESIGN.colors.textPrimary,
    fontWeight: "600",
  },
  planPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  planPillFree: {
    backgroundColor: DESIGN.colors.border,
  },
  planPillPremium: {
    backgroundColor: DESIGN.colors.primarySoft,
  },
  planPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  planPillTextFree: {
    color: DESIGN.colors.textSecondary,
  },
  planPillTextPremium: {
    color: DESIGN.colors.primary,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: DESIGN.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 6,
  },
  secondaryButtonText: {
    color: DESIGN.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: DESIGN.colors.primary,
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
  actionButtonDisabled: {
    opacity: 0.6,
  },
  subtleButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  subtleButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: DESIGN.colors.primary,
  },
  resetButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: DESIGN.colors.danger,
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
    backgroundColor: DESIGN.colors.primary,
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
