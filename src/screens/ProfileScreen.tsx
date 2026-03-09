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

        <View style={styles.planCard}>
          <Text style={styles.planTitle}>{isPremium ? "Premium Member" : "Free Plan"}</Text>
          <Text style={styles.planText}>
            {isPremium ? `Active plan: ${plan}` : "Upgrade to unlock advanced features."}
          </Text>
          {!isPremium ? (
            <TouchableOpacity style={styles.planButton} onPress={() => navigate("paywall")}>
              <Text style={styles.planButtonText}>View Premium</Text>
            </TouchableOpacity>
          ) : null}
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
    fontSize: DESIGN.typography.title,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.radius.md,
    padding: 14,
    marginBottom: 12,
    ...DESIGN.shadow.card,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  planText: {
    marginTop: 4,
    fontSize: 13,
    color: DESIGN.colors.textMuted,
  },
  planButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#4F46E5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  planButtonText: {
    color: "#FFFFFF",
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
    color: "#15803D",
  },
  locked: {
    color: DESIGN.colors.textMuted,
  },
  linkRow: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: 12,
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
