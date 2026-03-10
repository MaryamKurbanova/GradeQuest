import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
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

const NAV_ICON_LETTERS: Record<RouteKey, string> = {
  dashboard: "D",
  assignments: "T",
  assignmentForm: "A",
  exams: "E",
  examForm: "X",
  courses: "C",
  courseForm: "N",
  calendar: "C",
  profile: "P",
  gamification: "G",
  calculator: "M",
  paywall: "U",
  analytics: "S",
  widgets: "W",
  themes: "H",
  settings: "S",
  firstLaunch: "F",
};

const RootNavigator: React.FC = () => {
  const { isHydrated, hasCompletedOnboarding } = useAppSettings();
  const [activeRoute, setActiveRoute] = useState<RouteKey>(DEFAULT_ROUTE);
  const [showLaunchOverlay, setShowLaunchOverlay] = useState(true);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const launchOpacity = useRef(new Animated.Value(1)).current;
  const launchScale = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    contentOpacity.setValue(0);
    contentTranslateY.setValue(16);
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeRoute, contentOpacity, contentTranslateY, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    launchOpacity.setValue(1);
    launchScale.setValue(1);
    setShowLaunchOverlay(true);

    Animated.sequence([
      Animated.delay(180),
      Animated.parallel([
        Animated.timing(launchOpacity, {
          toValue: 0,
          duration: 580,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(launchScale, {
          toValue: 1.05,
          duration: 580,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) {
        setShowLaunchOverlay(false);
      }
    });
  }, [isHydrated, launchOpacity, launchScale]);

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

        <Animated.View
          style={[
            styles.content,
            { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
          ]}
        >
          <ActiveScreen />
        </Animated.View>

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
                  <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                    <Text style={[styles.navIconText, isActive && styles.navIconTextActive]}>
                      {NAV_ICON_LETTERS[route.key]}
                    </Text>
                  </View>
                  <Text style={[styles.navButtonText, isActive && styles.navButtonTextActive]}>
                    {route.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {showLaunchOverlay ? (
          <Animated.View pointerEvents="none" style={[styles.launchOverlay, { opacity: launchOpacity }]}>
            <View style={styles.launchOrbLarge} />
            <View style={styles.launchOrbSmall} />
            <Animated.View style={[styles.launchCard, { transform: [{ scale: launchScale }] }]}>
              <Text style={styles.launchBadge}>GRADEQUEST</Text>
              <Text style={styles.launchTitle}>Welcome back</Text>
              <Text style={styles.launchSubtitle}>Syncing your focus universe...</Text>
            </Animated.View>
          </Animated.View>
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
    paddingTop: DESIGN.spacing.sm,
    paddingBottom: DESIGN.spacing.lg,
    backgroundColor: DESIGN.colors.appBg,
  },
  appTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: DESIGN.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  screenTitle: {
    marginTop: 6,
    fontSize: 30,
    lineHeight: 36,
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
    borderWidth: 0,
    borderRadius: DESIGN.radius.lg,
    backgroundColor: DESIGN.colors.surfaceDark,
    paddingVertical: 8,
    paddingHorizontal: 8,
    ...DESIGN.shadow.card,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DESIGN.radius.md,
    paddingVertical: 6,
  },
  navButtonActive: {
    backgroundColor: "#0E2742",
  },
  navIconWrap: {
    width: 24,
    height: 24,
    borderRadius: DESIGN.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    backgroundColor: "#111C32",
    marginBottom: 3,
  },
  navIconWrapActive: {
    borderColor: DESIGN.colors.accentLime,
    backgroundColor: DESIGN.colors.accentLimeSoft,
  },
  navIconText: {
    fontSize: 10,
    fontWeight: "700",
    color: DESIGN.colors.textMuted,
  },
  navIconTextActive: {
    color: DESIGN.colors.textPrimary,
  },
  navButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: DESIGN.colors.textMuted,
  },
  navButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  launchOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(6, 11, 22, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  launchOrbLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: DESIGN.radius.pill,
    backgroundColor: "rgba(37, 99, 235, 0.28)",
    top: "24%",
    right: -60,
  },
  launchOrbSmall: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: DESIGN.radius.pill,
    backgroundColor: "rgba(34, 211, 238, 0.22)",
    bottom: "22%",
    left: -44,
  },
  launchCard: {
    width: "80%",
    maxWidth: 320,
    backgroundColor: "rgba(12, 24, 45, 0.95)",
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
    borderRadius: DESIGN.radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 22,
    ...DESIGN.shadow.card,
  },
  launchBadge: {
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: DESIGN.colors.textMuted,
    fontWeight: "700",
  },
  launchTitle: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 32,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  launchSubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: DESIGN.colors.textSecondary,
  },
});

export default RootNavigator;
