import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
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
import SettingsScreen from "../../screens/SettingsScreen";
import ThemesScreen from "../../screens/ThemesScreen";
import WidgetsScreen from "../../screens/WidgetsScreen";
import { DEFAULT_ROUTE, PRIMARY_NAV_ROUTES, getRouteLabel } from "../constants/routes";
import { NavigationProvider } from "./NavigationContext";
import { RouteKey } from "./types";

const RootNavigator: React.FC = () => {
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

  return (
    <NavigationProvider activeRoute={activeRoute} navigate={setActiveRoute}>
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>GradeQuest</Text>
          <Text style={styles.screenTitle}>{activeRouteLabel}</Text>
        </View>

        <View style={styles.content}>
          <ActiveScreen />
        </View>

        <View style={styles.navContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navRow}
          >
            {PRIMARY_NAV_ROUTES.map((route) => {
              const isActive = route.key === activeRoute;
              return (
                <TouchableOpacity
                  key={route.key}
                  style={[styles.navChip, isActive && styles.navChipActive]}
                  onPress={() => setActiveRoute(route.key)}
                >
                  <Text style={[styles.navChipText, isActive && styles.navChipTextActive]}>
                    {route.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
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
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
  },
  navRow: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  navChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    marginRight: 8,
  },
  navChipActive: {
    backgroundColor: "#1D4ED8",
  },
  navChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  navChipTextActive: {
    color: "#FFFFFF",
  },
});

export default RootNavigator;
