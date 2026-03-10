import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AnalyticsScreen from "../../screens/AnalyticsScreen";
import AssignmentFormScreen from "../../screens/AssignmentFormScreen";
import AssignmentsScreen from "../../screens/AssignmentsScreen";
import CalendarScreen from "../../screens/CalendarScreen";
import CourseFormScreen from "../../screens/CourseFormScreen";
import CoursesScreen from "../../screens/CoursesScreen";
import DashboardScreen from "../../screens/DashboardScreen";
import ExamFormScreen from "../../screens/ExamFormScreen";
import ExamsScreen from "../../screens/ExamsScreen";
import FirstLaunchSetupScreen from "../../screens/FirstLaunchSetupScreen";
import GamificationScreen from "../../screens/GamificationScreen";
import GradeCalculatorScreen from "../../screens/GradeCalculatorScreen";
import PaywallScreen from "../../screens/PaywallScreen";
import ProfileScreen from "../../screens/ProfileScreen";
import SettingsScreen from "../../screens/SettingsScreen";
import ThemesScreen from "../../screens/ThemesScreen";
import WidgetsScreen from "../../screens/WidgetsScreen";
import { FEATURE_FLAGS } from "../constants/featureFlags";
import { DEFAULT_ROUTE, PRIMARY_NAV_ROUTES, getRouteLabel } from "../constants/routes";
import { useAppSettings } from "../providers/AppSettingsProvider";
import { DESIGN } from "../theme/design";
import { NavigationProvider } from "./NavigationContext";
import { RouteKey } from "./types";

const RootNavigator: React.FC = () => {
  const { isHydrated, hasCompletedOnboarding } = useAppSettings();
  const [activeRoute, setActiveRoute] = useState<RouteKey>(DEFAULT_ROUTE);

  const screenMap: Record<RouteKey, React.ComponentType> = useMemo(
    () => ({
      dashboard: DashboardScreen,
      assignments: AssignmentsScreen,
      assignmentForm: AssignmentFormScreen,
      exams: ExamsScreen,
      examForm: ExamFormScreen,
      courses: CoursesScreen,
      courseForm: CourseFormScreen,
      calendar: CalendarScreen,
      profile: ProfileScreen,
      gamification: GamificationScreen,
      calculator: GradeCalculatorScreen,
      paywall: PaywallScreen,
      analytics: AnalyticsScreen,
      widgets: WidgetsScreen,
      themes: ThemesScreen,
      settings: SettingsScreen,
      firstLaunch: FirstLaunchSetupScreen,
    }),
    [],
  );

  const ActiveScreen = screenMap[activeRoute];
  const activeRouteLabel = getRouteLabel(activeRoute);
  const showOnboarding = activeRoute === "firstLaunch";
  const showBottomTabs = !showOnboarding;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (FEATURE_FLAGS.firstLaunchSetupEnabled && !hasCompletedOnboarding) {
      if (activeRoute !== "firstLaunch") {
        setActiveRoute("firstLaunch");
      }
      return;
    }

    if (activeRoute === "firstLaunch") {
      setActiveRoute(DEFAULT_ROUTE);
    }
  }, [activeRoute, hasCompletedOnboarding, isHydrated]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.content} />
      </SafeAreaView>
    );
  }

  return (
    <NavigationProvider activeRoute={activeRoute} navigate={setActiveRoute}>
      <SafeAreaView style={styles.root}>
        {!showOnboarding ? (
          <View style={styles.header}>
            <Text style={styles.appTitle}>GradeQuest</Text>
            <Text style={styles.screenTitle}>{activeRouteLabel}</Text>
          </View>
        ) : null}

        <View style={styles.content}>
          <ActiveScreen />
        </View>

        {showBottomTabs ? (
          <View style={styles.navContainer}>
            {PRIMARY_NAV_ROUTES.map((route) => {
              const isActive = route.key === activeRoute;
              return (
                <TouchableOpacity
                  key={route.key}
                  style={[styles.navButton, isActive && styles.navButtonActive]}
                  onPress={() => setActiveRoute(route.key)}
                >
                  <Text style={[styles.navButtonText, isActive && styles.navButtonTextActive]}>
                    {route.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </SafeAreaView>
    </NavigationProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DESIGN.colors.appBg,
  },
  header: {
    paddingHorizontal: DESIGN.spacing.lg,
    paddingTop: DESIGN.spacing.xs,
    paddingBottom: DESIGN.spacing.sm,
    backgroundColor: DESIGN.colors.appBg,
  },
  appTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: DESIGN.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  screenTitle: {
    marginTop: 4,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: DESIGN.spacing.lg,
    marginBottom: DESIGN.spacing.md,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.radius.md,
    backgroundColor: DESIGN.colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DESIGN.radius.sm,
    paddingVertical: 8,
  },
  navButtonActive: {
    backgroundColor: DESIGN.colors.primarySoft,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: DESIGN.colors.textMuted,
  },
  navButtonTextActive: {
    color: DESIGN.colors.textPrimary,
    fontWeight: "700",
  },
});

export default RootNavigator;
