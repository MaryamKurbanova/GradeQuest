import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { DESIGN } from "../app/theme/design";
import { FEATURE_FLAGS } from "../app/constants/featureFlags";
import { useAppNavigation } from "../app/navigation/NavigationContext";
import { useSubscription } from "../app/providers/SubscriptionProvider";
import { useWidgets } from "../app/providers/WidgetProvider";
import { formatShortTimeLabel, getRelativeDayLabel } from "../utils/date";

const WidgetsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { isPremium } = useSubscription();
  const { config, setConfigValue, snapshot, quickActions } = useWidgets();

  if (!FEATURE_FLAGS.premiumWidgetsEnabled) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedTitle}>Widgets are unavailable</Text>
          <Text style={styles.lockedText}>
            Widget support is disabled in this build. Enable premium widgets in feature flags.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedTitle}>Widgets & Quick Access are Premium</Text>
          <Text style={styles.lockedText}>
            Unlock home-screen widget previews and one-tap quick add tools for assignments and
            exams.
          </Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={() => navigate("paywall")}>
            <Text style={styles.upgradeButtonText}>View Premium Plans</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Widgets</Text>
        <Text style={styles.title}>Quick access hub</Text>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Widget preview snapshot</Text>
          {config.showTodayAssignments ? (
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Due today</Text>
              <Text style={styles.previewValue}>{snapshot.todayAssignments}</Text>
            </View>
          ) : null}
          {config.showUpcomingExams ? (
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Upcoming exams</Text>
              <Text style={styles.previewValue}>{snapshot.upcomingExams}</Text>
            </View>
          ) : null}
          {config.showProgressCard ? (
            <>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Current streak</Text>
                <Text style={styles.previewValue}>{snapshot.streakDays} days</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Points</Text>
                <Text style={styles.previewValue}>{snapshot.points}</Text>
              </View>
            </>
          ) : null}
          <Text style={styles.previewHint}>
            Updated {getRelativeDayLabel(snapshot.lastUpdatedAt)} at{" "}
            {formatShortTimeLabel(snapshot.lastUpdatedAt)}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Widget modules</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show today assignments</Text>
            <Switch
              value={config.showTodayAssignments}
              onValueChange={(value) => setConfigValue("showTodayAssignments", value)}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show upcoming exams</Text>
            <Switch
              value={config.showUpcomingExams}
              onValueChange={(value) => setConfigValue("showUpcomingExams", value)}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show streak & points card</Text>
            <Switch
              value={config.showProgressCard}
              onValueChange={(value) => setConfigValue("showProgressCard", value)}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <Text style={styles.sectionTitle}>Quick add actions</Text>
            <Switch
              value={config.enableQuickAdd}
              onValueChange={(value) => setConfigValue("enableQuickAdd", value)}
            />
          </View>
          <Text style={styles.helperText}>
            These shortcuts simulate widget quick actions and can be wired to real home-screen
            widgets later.
          </Text>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionButton, !action.enabled && styles.quickActionButtonDisabled]}
              onPress={() => navigate(action.route)}
              disabled={!action.enabled}
            >
              <Text
                style={[
                  styles.quickActionTitle,
                  !action.enabled && styles.quickActionTitleDisabled,
                ]}
              >
                {action.label}
              </Text>
              <Text style={styles.quickActionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
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
  lockedContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  lockedText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: DESIGN.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  previewCard: {
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
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: DESIGN.colors.textSecondary,
    fontWeight: "600",
  },
  previewValue: {
    fontSize: 16,
    color: DESIGN.colors.textPrimary,
    fontWeight: "700",
  },
  previewHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
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
  helperText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },
  quickActionButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
  },
  quickActionButtonDisabled: {
    opacity: 0.5,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  quickActionTitleDisabled: {
    color: "#64748B",
  },
  quickActionDescription: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },
});

export default WidgetsScreen;
