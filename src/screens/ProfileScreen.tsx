import React, { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FEATURE_FLAGS } from "../app/constants/featureFlags";
import { useAppNavigation } from "../app/navigation/NavigationContext";
import { useAppSettings } from "../app/providers/AppSettingsProvider";
import { useGamification } from "../app/providers/GamificationProvider";
import { useSubscription } from "../app/providers/SubscriptionProvider";
import { DESIGN } from "../app/theme/design";

const ProfileScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { displayName } = useAppSettings();
  const { isPremium, plan } = useSubscription();
  const { points, streakDays, level, badges } = useGamification();

  const unlockedBadges = useMemo(
    () => badges.filter((badge) => badge.unlocked),
    [badges],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Profile</Text>
        <Text style={styles.title}>{displayName || "Guest Student"}</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroGlowTop} />
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{(displayName || "G").slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroName}>{displayName || "Guest Student"}</Text>
            <Text style={styles.heroSubtitle}>
              {isPremium ? `Premium active • ${plan}` : "Free plan • upgrade for advanced tools"}
            </Text>
          </View>
          {!isPremium ? (
            <TouchableOpacity style={styles.planButton} onPress={() => navigate("paywall")}>
              <Text style={styles.planButtonText}>Upgrade</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.premiumDot} />
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streakDays}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>L{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <Text style={styles.sectionMeta}>
              {unlockedBadges.length}/{badges.length} unlocked
            </Text>
          </View>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.badgeRow}>
              <View style={styles.badgeTextWrap}>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>
              <Text style={[styles.badgeStatus, badge.unlocked ? styles.unlocked : styles.locked]}>
                {badge.unlocked ? "Unlocked" : "Locked"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick access</Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigate("calculator")}>
            <Text style={styles.linkText}>Grade Target Calculator</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigate("gamification")}>
            <Text style={styles.linkText}>Gamification Hub</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigate("themes")}>
            <Text style={styles.linkText}>Themes & Personalization</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigate("settings")}>
            <Text style={styles.linkText}>Settings</Text>
          </TouchableOpacity>
          {FEATURE_FLAGS.premiumWidgetsEnabled ? (
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigate(isPremium ? "widgets" : "paywall")}
            >
              <Text style={styles.linkText}>Widgets & Quick Access</Text>
            </TouchableOpacity>
          ) : null}
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
    fontSize: 14,
    color: DESIGN.colors.textMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: DESIGN.typography.headline,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
    marginBottom: 14,
  },
  planCard: {
    display: "none",
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: DESIGN.colors.surfaceDark,
    borderRadius: DESIGN.radius.lg,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...DESIGN.shadow.card,
  },
  heroGlowTop: {
    position: "absolute",
    top: -26,
    right: -18,
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: "rgba(34, 211, 238, 0.2)",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: DESIGN.radius.pill,
    backgroundColor: DESIGN.colors.accentLimeSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: DESIGN.colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  heroSubtitle: {
    marginTop: 2,
    color: DESIGN.colors.textMuted,
    fontSize: 12,
  },
  premiumDot: {
    width: 10,
    height: 10,
    borderRadius: DESIGN.radius.pill,
    backgroundColor: DESIGN.colors.accentLime,
  },
  planTitle: {
    display: "none",
  },
  planText: {
    display: "none",
  },
  planButton: {
    alignSelf: "center",
    backgroundColor: DESIGN.colors.accentLimeSoft,
    borderWidth: 1,
    borderColor: DESIGN.colors.accentLime,
    borderRadius: DESIGN.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  planButtonText: {
    color: DESIGN.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
    ...DESIGN.shadow.card,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: DESIGN.colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  sectionMeta: {
    fontSize: 12,
    color: DESIGN.colors.textMuted,
    fontWeight: "600",
  },
  badgeRow: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...DESIGN.shadow.card,
  },
  badgeTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  badgeDescription: {
    marginTop: 2,
    fontSize: 12,
    color: DESIGN.colors.textMuted,
  },
  badgeStatus: {
    fontSize: 11,
    fontWeight: "700",
  },
  unlocked: {
    color: DESIGN.colors.success,
  },
  locked: {
    color: DESIGN.colors.textMuted,
  },
  linkRow: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    ...DESIGN.shadow.card,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
  },
});

export default ProfileScreen;
