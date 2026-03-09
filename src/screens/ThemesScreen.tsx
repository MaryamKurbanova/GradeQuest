import React, { useMemo } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppNavigation } from "../app/navigation/NavigationContext";
import { useStudyData } from "../app/providers/StudyDataProvider";
import { useSubscription } from "../app/providers/SubscriptionProvider";
import { useTheme } from "../app/providers/ThemeProvider";
import type {
  CourseIconStyle,
  DashboardBackgroundPreset,
  StreakAnimationStyle,
  ThemeId,
} from "../app/providers/ThemeProvider";

type ThemePack = {
  id: ThemeId;
  name: string;
  styleHint: string;
  premium: boolean;
  colors: [string, string];
};

type CourseColorOption = {
  colorHex: string;
  label: string;
  premium: boolean;
};

type CourseIconOption = {
  style: CourseIconStyle;
  label: string;
  premium: boolean;
};

type DashboardBackgroundOption = {
  id: DashboardBackgroundPreset;
  name: string;
  colors: [string, string];
  premium: boolean;
};

type StreakAnimationOption = {
  style: StreakAnimationStyle;
  label: string;
  hint: string;
  premium: boolean;
};

const THEME_PACKS: ThemePack[] = [
  {
    id: "light",
    name: "Light",
    styleHint: "Clean and bright",
    premium: false,
    colors: ["#EEF2FF", "#FFFFFF"],
  },
  {
    id: "dark",
    name: "Dark",
    styleHint: "Easy on the eyes",
    premium: false,
    colors: ["#1E293B", "#0F172A"],
  },
  {
    id: "pastel",
    name: "Pastel",
    styleHint: "Soft and calm tones",
    premium: true,
    colors: ["#FBCFE8", "#C7D2FE"],
  },
  {
    id: "gradient",
    name: "Gradient",
    styleHint: "Vibrant smooth blend",
    premium: true,
    colors: ["#A78BFA", "#22D3EE"],
  },
  {
    id: "vibrant",
    name: "Vibrant",
    styleHint: "High energy colors",
    premium: true,
    colors: ["#F97316", "#F43F5E"],
  },
];

const COURSE_COLOR_OPTIONS: CourseColorOption[] = [
  { colorHex: "#6366F1", label: "Indigo", premium: false },
  { colorHex: "#22C55E", label: "Emerald", premium: false },
  { colorHex: "#0EA5E9", label: "Sky", premium: false },
  { colorHex: "#F97316", label: "Orange", premium: true },
  { colorHex: "#E11D48", label: "Rose", premium: true },
  { colorHex: "#8B5CF6", label: "Violet", premium: true },
];

const COURSE_ICON_OPTIONS: CourseIconOption[] = [
  { style: "book", label: "Book", premium: false },
  { style: "calculator", label: "Calculator", premium: false },
  { style: "flask", label: "Lab", premium: true },
  { style: "globe", label: "Global", premium: true },
];

const DASHBOARD_BACKGROUND_OPTIONS: DashboardBackgroundOption[] = [
  { id: "default", name: "Default", colors: ["#F5F7FB", "#EEF2FF"], premium: false },
  { id: "aurora", name: "Aurora", colors: ["#E0F2FE", "#CCFBF1"], premium: true },
  { id: "sunset", name: "Sunset", colors: ["#FFEDD5", "#FCE7F3"], premium: true },
  { id: "midnight", name: "Midnight", colors: ["#1E293B", "#334155"], premium: true },
];

const STREAK_ANIMATION_OPTIONS: StreakAnimationOption[] = [
  { style: "subtle", label: "Subtle", hint: "Low-motion highlight", premium: false },
  { style: "glow", label: "Glow", hint: "Soft luminous pulse", premium: true },
  { style: "burst", label: "Burst", hint: "High-energy accent", premium: true },
];

const ThemesScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { applyCourseStyleDefaults } = useStudyData();
  const { isPremium } = useSubscription();
  const {
    activeTheme,
    setActiveTheme,
    courseAccentColor,
    setCourseAccentColor,
    courseIconStyle,
    setCourseIconStyle,
    dashboardBackgroundPreset,
    setDashboardBackgroundPreset,
    streakAnimationStyle,
    setStreakAnimationStyle,
  } = useTheme();

  const selectedTheme = useMemo(
    () => THEME_PACKS.find((theme) => theme.id === activeTheme),
    [activeTheme],
  );
  const selectedCourseColor = useMemo(
    () => COURSE_COLOR_OPTIONS.find((option) => option.colorHex === courseAccentColor),
    [courseAccentColor],
  );
  const selectedIconStyle = useMemo(
    () => COURSE_ICON_OPTIONS.find((option) => option.style === courseIconStyle),
    [courseIconStyle],
  );
  const selectedDashboardBackground = useMemo(
    () => DASHBOARD_BACKGROUND_OPTIONS.find((option) => option.id === dashboardBackgroundPreset),
    [dashboardBackgroundPreset],
  );
  const selectedStreakAnimation = useMemo(
    () => STREAK_ANIMATION_OPTIONS.find((option) => option.style === streakAnimationStyle),
    [streakAnimationStyle],
  );

  const enforcePremium = (isPremiumOption: boolean): boolean => {
    if (!isPremiumOption || isPremium) {
      return true;
    }

    Alert.alert(
      "Premium personalization",
      "Upgrade to Premium to unlock this personalization option.",
      [
        { text: "Not now", style: "cancel" },
        { text: "View plans", onPress: () => navigate("paywall") },
      ],
    );
    return false;
  };

  const applyTheme = (theme: ThemePack) => {
    if (!enforcePremium(theme.premium)) {
      return;
    }
    setActiveTheme(theme.id);
  };

  const applyCourseColor = (option: CourseColorOption) => {
    if (!enforcePremium(option.premium)) {
      return;
    }
    setCourseAccentColor(option.colorHex);
  };

  const applyCourseIcon = (option: CourseIconOption) => {
    if (!enforcePremium(option.premium)) {
      return;
    }
    setCourseIconStyle(option.style);
  };

  const applyDashboardBackground = (option: DashboardBackgroundOption) => {
    if (!enforcePremium(option.premium)) {
      return;
    }
    setDashboardBackgroundPreset(option.id);
  };

  const applyStreakAnimationStyle = (option: StreakAnimationOption) => {
    if (!enforcePremium(option.premium)) {
      return;
    }
    setStreakAnimationStyle(option.style);
  };

  const onReset = () => {
    setActiveTheme("light");
    setCourseAccentColor("#6366F1");
    setCourseIconStyle("book");
    setDashboardBackgroundPreset("default");
    setStreakAnimationStyle("subtle");
    applyCourseStyleDefaults({
      colorHex: "#6366F1",
      icon: "book",
    });
  };

  const onSave = () => {
    applyCourseStyleDefaults({
      colorHex: courseAccentColor,
      icon: courseIconStyle,
    });
    Alert.alert("Saved", "Your personalization settings have been updated.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Personalization</Text>
        <Text style={styles.title}>Themes and style</Text>

        <View style={styles.activeThemeCard}>
          <Text style={styles.activeThemeLabel}>Active theme</Text>
          <Text style={styles.activeThemeName}>{selectedTheme?.name ?? "Light"}</Text>
          <Text style={styles.activeThemeHint}>
            {selectedTheme?.styleHint ?? "Clean and bright"}
          </Text>
          <Text style={styles.activeThemeMeta}>
            Course accent: {selectedCourseColor?.label ?? "Indigo"} • Icon style:{" "}
            {selectedIconStyle?.label ?? "Book"}
          </Text>
          <Text style={styles.activeThemeMeta}>
            Dashboard: {selectedDashboardBackground?.name ?? "Default"} • Streak:{" "}
            {selectedStreakAnimation?.label ?? "Subtle"}
          </Text>
        </View>

        {!isPremium ? (
          <View style={styles.premiumNotice}>
            <Text style={styles.premiumNoticeTitle}>Premium unlocks more style packs</Text>
            <Text style={styles.premiumNoticeText}>
              Upgrade to unlock advanced course styles, dashboard backgrounds, and streak effects.
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={() => navigate("paywall")}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme packs</Text>
          {THEME_PACKS.map((theme) => {
            const isSelected = activeTheme === theme.id;
            const isLocked = theme.premium && !isPremium;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  isSelected && styles.themeCardSelected,
                  isLocked && styles.themeCardLocked,
                ]}
                onPress={() => applyTheme(theme)}
              >
                <View style={styles.themePreview}>
                  <View style={[styles.previewColor, { backgroundColor: theme.colors[0] }]} />
                  <View style={[styles.previewColor, { backgroundColor: theme.colors[1] }]} />
                </View>

                <View style={styles.themeTextWrap}>
                  <View style={styles.themeHeaderRow}>
                    <Text style={styles.themeName}>{theme.name}</Text>
                    {theme.premium ? (
                      <View style={styles.pillPremium}>
                        <Text style={styles.pillPremiumText}>Premium</Text>
                      </View>
                    ) : (
                      <View style={styles.pillFree}>
                        <Text style={styles.pillFreeText}>Free</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.themeHint}>{theme.styleHint}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course accent color</Text>
          <View style={styles.colorRow}>
            {COURSE_COLOR_OPTIONS.map((option) => {
              const isSelected = option.colorHex === courseAccentColor;
              const isLocked = option.premium && !isPremium;
              return (
                <TouchableOpacity
                  key={option.colorHex}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: option.colorHex },
                    isSelected && styles.colorCircleSelected,
                    isLocked && styles.lockedOption,
                  ]}
                  onPress={() => applyCourseColor(option)}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course icon style</Text>
          <View style={styles.iconRow}>
            {COURSE_ICON_OPTIONS.map((option) => {
              const isSelected = courseIconStyle === option.style;
              const isLocked = option.premium && !isPremium;
              return (
                <TouchableOpacity
                  key={option.style}
                  style={[
                    styles.iconChip,
                    isSelected && styles.iconChipSelected,
                    isLocked && styles.lockedOption,
                  ]}
                  onPress={() => applyCourseIcon(option)}
                >
                  <Text style={[styles.iconChipText, isSelected && styles.iconChipTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard background</Text>
          {DASHBOARD_BACKGROUND_OPTIONS.map((option) => {
            const isSelected = dashboardBackgroundPreset === option.id;
            const isLocked = option.premium && !isPremium;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.themeCard,
                  isSelected && styles.themeCardSelected,
                  isLocked && styles.themeCardLocked,
                ]}
                onPress={() => applyDashboardBackground(option)}
              >
                <View style={styles.themePreview}>
                  <View style={[styles.previewColor, { backgroundColor: option.colors[0] }]} />
                  <View style={[styles.previewColor, { backgroundColor: option.colors[1] }]} />
                </View>
                <View style={styles.themeTextWrap}>
                  <View style={styles.themeHeaderRow}>
                    <Text style={styles.themeName}>{option.name}</Text>
                    {option.premium ? (
                      <View style={styles.pillPremium}>
                        <Text style={styles.pillPremiumText}>Premium</Text>
                      </View>
                    ) : (
                      <View style={styles.pillFree}>
                        <Text style={styles.pillFreeText}>Free</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.themeHint}>Applies to dashboard visual background.</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streak animation style</Text>
          <View style={styles.iconRow}>
            {STREAK_ANIMATION_OPTIONS.map((option) => {
              const isSelected = streakAnimationStyle === option.style;
              const isLocked = option.premium && !isPremium;
              return (
                <TouchableOpacity
                  key={option.style}
                  style={[
                    styles.animationChip,
                    isSelected && styles.animationChipSelected,
                    isLocked && styles.lockedOption,
                  ]}
                  onPress={() => applyStreakAnimationStyle(option)}
                >
                  <Text
                    style={[
                      styles.animationChipTitle,
                      isSelected && styles.animationChipTitleSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.animationChipHint}>{option.hint}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onReset}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
            <Text style={styles.primaryButtonText}>Save changes</Text>
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
    marginBottom: 14,
  },
  activeThemeCard: {
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
  activeThemeLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  activeThemeName: {
    marginTop: 4,
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "700",
  },
  activeThemeHint: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },
  activeThemeMeta: {
    marginTop: 6,
    fontSize: 12,
    color: "#475569",
    lineHeight: 17,
  },
  premiumNotice: {
    backgroundColor: "#EEF2FF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  premiumNoticeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#312E81",
    marginBottom: 4,
  },
  premiumNoticeText: {
    fontSize: 13,
    color: "#4338CA",
    lineHeight: 18,
  },
  upgradeButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#4F46E5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  themeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  themeCardSelected: {
    borderColor: "#4F46E5",
  },
  themeCardLocked: {
    opacity: 0.65,
  },
  themePreview: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  previewColor: {
    flex: 1,
  },
  themeTextWrap: {
    flex: 1,
  },
  themeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  themeName: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "700",
    marginRight: 8,
  },
  themeHint: {
    fontSize: 12,
    color: "#64748B",
  },
  pillPremium: {
    backgroundColor: "#EDE9FE",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  pillPremiumText: {
    fontSize: 10,
    color: "#6D28D9",
    fontWeight: "700",
  },
  pillFree: {
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  pillFreeText: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "700",
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
    borderColor: "#0F172A",
  },
  lockedOption: {
    opacity: 0.55,
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
  animationChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 110,
  },
  animationChipSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  animationChipTitle: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
  },
  animationChipTitleSelected: {
    color: "#1D4ED8",
  },
  animationChipHint: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 6,
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1.4,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginLeft: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default ThemesScreen;
