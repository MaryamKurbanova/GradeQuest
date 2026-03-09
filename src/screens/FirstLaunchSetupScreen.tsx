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
import { useAppNavigation } from "../app/navigation/NavigationContext";
import { useAppSettings } from "../app/providers/AppSettingsProvider";
import { useNotifications } from "../app/providers/NotificationProvider";
import { useTheme } from "../app/providers/ThemeProvider";

type ThemeChoice = "light" | "dark";
type FocusGoal = "consistency" | "grades" | "balance";
type OnboardingStep = 0 | 1 | 2;

const FirstLaunchSetupScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const {
    setDisplayName: setGlobalDisplayName,
    setHasCompletedOnboarding,
  } = useAppSettings();
  const { setActiveTheme } = useTheme();
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    reminderStyle,
    setReminderStyle,
    requestPermission,
  } = useNotifications();
  const [displayName, setDisplayNameInput] = useState("");
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>("light");
  const [focusGoal, setFocusGoal] = useState<FocusGoal>("consistency");
  const [step, setStep] = useState<OnboardingStep>(0);

  const steps = useMemo(
    () => [
      { key: 0, title: "Welcome", subtitle: "Set your student profile basics." },
      { key: 1, title: "Study style", subtitle: "Personalize how you want to study." },
      { key: 2, title: "Reminders", subtitle: "Enable nudges so you stay on track." },
    ],
    [],
  );

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert("Permission needed", "Enable notifications in your device settings.");
        setNotificationsEnabled(false);
        return;
      }
    }

    setNotificationsEnabled(enabled);
  };

  const completeOnboarding = () => {
    setActiveTheme(themeChoice);
    setGlobalDisplayName(displayName.trim() || "Guest Student");
    setHasCompletedOnboarding(true);

    Alert.alert(
      "All set",
      `Welcome${displayName.trim() ? `, ${displayName.trim()}` : ""}! Your app is ready.`,
    );
    navigate("dashboard");
  };

  const onContinue = () => {
    if (step < 2) {
      setStep((prev) => (prev + 1) as OnboardingStep);
      return;
    }
    completeOnboarding();
  };

  const onSkip = () => {
    setHasCompletedOnboarding(true);
    Alert.alert("Skipped", "You can customize these settings anytime in Profile and Settings.");
    navigate("dashboard");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Welcome to GradeQuest</Text>
        <Text style={styles.title}>Onboarding</Text>
        <Text style={styles.subtitle}>{steps[step].subtitle}</Text>

        <View style={styles.progressRow}>
          {steps.map((item) => {
            const isActive = item.key === step;
            const isDone = item.key < step;
            return (
              <View
                key={item.key}
                style={[
                  styles.progressDot,
                  isActive && styles.progressDotActive,
                  isDone && styles.progressDotDone,
                ]}
              />
            );
          })}
        </View>

        {step === 0 ? (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>What should we call you?</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayNameInput}
                placeholder="Optional display name"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
              <Text style={styles.helperText}>Leave blank to continue as Guest Student.</Text>
            </View>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Default theme</Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[styles.choiceChip, themeChoice === "light" && styles.choiceChipActive]}
                  onPress={() => setThemeChoice("light")}
                >
                  <Text
                    style={[styles.choiceChipText, themeChoice === "light" && styles.choiceChipTextActive]}
                  >
                    Light
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.choiceChip, themeChoice === "dark" && styles.choiceChipActive]}
                  onPress={() => setThemeChoice("dark")}
                >
                  <Text
                    style={[styles.choiceChipText, themeChoice === "dark" && styles.choiceChipTextActive]}
                  >
                    Dark
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>What is your main focus?</Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[styles.choiceChip, focusGoal === "consistency" && styles.choiceChipActive]}
                  onPress={() => setFocusGoal("consistency")}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      focusGoal === "consistency" && styles.choiceChipTextActive,
                    ]}
                  >
                    Consistency
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.choiceChip, focusGoal === "grades" && styles.choiceChipActive]}
                  onPress={() => setFocusGoal("grades")}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      focusGoal === "grades" && styles.choiceChipTextActive,
                    ]}
                  >
                    Better grades
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.choiceChip, focusGoal === "balance" && styles.choiceChipActive]}
                  onPress={() => setFocusGoal("balance")}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      focusGoal === "balance" && styles.choiceChipTextActive,
                    ]}
                  >
                    Study balance
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                Great choice. Gamification, streaks, and reminders will help you stay accountable.
              </Text>
            </View>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>What you will get</Text>
              <Text style={styles.helperText}>• Assignment and exam planner</Text>
              <Text style={styles.helperText}>• Grade Target Calculator</Text>
              <Text style={styles.helperText}>• Points, badges, and celebration popups</Text>
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Enable reminders</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(enabled) => {
                    void handleNotificationToggle(enabled);
                  }}
                />
              </View>
              <Text style={styles.helperText}>
                Turn this off if you want to start quietly and enable reminders later.
              </Text>
            </View>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Reminder style</Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[
                    styles.choiceChip,
                    reminderStyle === "standard" && styles.choiceChipActive,
                    !notificationsEnabled && styles.choiceChipDisabled,
                  ]}
                  onPress={() => setReminderStyle("standard")}
                  disabled={!notificationsEnabled}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      reminderStyle === "standard" && styles.choiceChipTextActive,
                    ]}
                  >
                    Standard
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.choiceChip,
                    reminderStyle === "focused" && styles.choiceChipActive,
                    !notificationsEnabled && styles.choiceChipDisabled,
                  ]}
                  onPress={() => setReminderStyle("focused")}
                  disabled={!notificationsEnabled}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      reminderStyle === "focused" && styles.choiceChipTextActive,
                    ]}
                  >
                    Focused
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                Focused adds stronger nudges to protect streaks and study momentum.
              </Text>
            </View>
          </>
        ) : null}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              if (step === 0) {
                onSkip();
              } else {
                setStep((prev) => (prev - 1) as OnboardingStep);
              }
            }}
          >
            <Text style={styles.skipButtonText}>{step === 0 ? "Skip" : "Back"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>{step === 2 ? "Finish" : "Continue"}</Text>
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
    fontSize: 30,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 14,
  },
  progressRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  progressDot: {
    width: 26,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    marginRight: 6,
  },
  progressDotActive: {
    backgroundColor: "#4F46E5",
  },
  progressDotDone: {
    backgroundColor: "#22C55E",
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
  choiceRow: {
    flexDirection: "row",
  },
  choiceChip: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  choiceChipActive: {
    backgroundColor: "#1D4ED8",
  },
  choiceChipDisabled: {
    opacity: 0.55,
  },
  choiceChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  choiceChipTextActive: {
    color: "#FFFFFF",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  skipButton: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 6,
  },
  skipButtonText: {
    color: "#0F172A",
    fontWeight: "700",
  },
  continueButton: {
    flex: 1.3,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginLeft: 6,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default FirstLaunchSetupScreen;
