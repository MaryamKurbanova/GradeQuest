import React, { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSubscription } from "../app/providers/SubscriptionProvider";
import { useTheme } from "../app/providers/ThemeProvider";
import type { ThemeId } from "../app/providers/ThemeProvider";

type ThemePack = {
  id: ThemeId;
  name: string;
  styleHint: string;
  premium: boolean;
  colors: [string, string];
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

const COURSE_COLOR_OPTIONS = ["#6366F1", "#22C55E", "#F97316", "#0EA5E9", "#E11D48", "#8B5CF6"];

const ThemesScreen: React.FC = () => {
  const { isPremium, startMockPremium } = useSubscription();
  const { activeTheme, setActiveTheme } = useTheme();
  const [selectedCourseColor, setSelectedCourseColor] = useState(COURSE_COLOR_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState("book");

  const selectedTheme = useMemo(
    () => THEME_PACKS.find((theme) => theme.id === activeTheme),
    [activeTheme],
  );

  const applyTheme = (theme: ThemePack) => {
    if (theme.premium && !isPremium) {
      Alert.alert(
        "Premium theme",
        "Upgrade to Premium to use this theme pack.",
        [
          { text: "Not now", style: "cancel" },
          { text: "Upgrade (Mock)", onPress: () => startMockPremium("yearly") },
        ],
      );
      return;
    }
    setActiveTheme(theme.id);
  };

  const onReset = () => {
    setActiveTheme("light");
    setSelectedCourseColor(COURSE_COLOR_OPTIONS[0]);
    setSelectedIcon("book");
  };

  const onSave = () => {
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
        </View>

        {!isPremium ? (
          <View style={styles.premiumNotice}>
            <Text style={styles.premiumNoticeTitle}>Premium unlocks more style packs</Text>
            <Text style={styles.premiumNoticeText}>
              Upgrade to unlock Pastel, Gradient, and Vibrant themes plus extra dashboard effects.
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={() => startMockPremium("yearly")}>
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
          <Text style={styles.sectionTitle}>Course color</Text>
          <View style={styles.colorRow}>
            {COURSE_COLOR_OPTIONS.map((color) => {
              const isSelected = color === selectedCourseColor;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    isSelected && styles.colorCircleSelected,
                  ]}
                  onPress={() => setSelectedCourseColor(color)}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course icon style</Text>
          <View style={styles.iconRow}>
            {["book", "flask", "calculator", "globe"].map((icon) => {
              const isSelected = selectedIcon === icon;
              return (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconChip, isSelected && styles.iconChipSelected]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={[styles.iconChipText, isSelected && styles.iconChipTextSelected]}>
                    {icon}
                  </Text>
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
