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
                  style={styles.navButton}
                  onPress={() => setActiveRoute(route.key)}
                >
                  <View style={[styles.navDot, isActive && styles.navDotActive]} />
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
    backgroundColor: "#F5F7FB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  appTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  screenTitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },
  content: {
    flex: 1,
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
  },
  navDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    marginBottom: 4,
  },
  navDotActive: {
    backgroundColor: "#1D4ED8",
  },
  navButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  navButtonTextActive: {
    color: "#1D4ED8",
  },
});

export default RootNavigator;
