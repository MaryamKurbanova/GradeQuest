import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { DESIGN } from "../theme/design";
import { useAppSettings } from "./AppSettingsProvider";
import { useSubscription } from "./SubscriptionProvider";

type CelebrationKind = "assignment" | "exam";

type TriggerCelebrationInput = {
  kind: CelebrationKind;
  title: string;
};

type CelebrationContextValue = {
  triggerCelebration: (input: TriggerCelebrationInput) => void;
};

type CelebrationViewModel = {
  id: string;
  kind: CelebrationKind;
  label: string;
  title: string;
  subtitle: string;
  isPremium: boolean;
};

const CelebrationContext = createContext<CelebrationContextValue | undefined>(undefined);

export const CelebrationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { celebrationEffectsEnabled } = useAppSettings();
  const { isPremium } = useSubscription();

  const [activeCelebration, setActiveCelebration] = useState<CelebrationViewModel | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const activeAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      if (activeAnimation.current) {
        activeAnimation.current.stop();
      }
    };
  }, []);

  const triggerCelebration = useCallback(
    (input: TriggerCelebrationInput) => {
      if (!celebrationEffectsEnabled) {
        return;
      }

      const basePoints = input.kind === "exam" ? 30 : 20;
      const awardedPoints = isPremium ? Math.round(basePoints * 1.5) : basePoints;
      const label = input.kind === "exam" ? "Exam completed" : "Assignment completed";
      const subtitle = isPremium
        ? `Outstanding effort! +${awardedPoints} XP with your Premium boost.`
        : `Amazing progress! +${awardedPoints} XP earned.`;

      setActiveCelebration({
        id: `${Date.now()}`,
        kind: input.kind,
        label,
        title: input.title,
        subtitle,
        isPremium,
      });

      opacity.setValue(0);
      translateY.setValue(24);
      scale.setValue(0.9);
      backdropOpacity.setValue(0);

      if (activeAnimation.current) {
        activeAnimation.current.stop();
      }

      const animation = Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1900),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -16,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.96,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
      ]);

      activeAnimation.current = animation;
      animation.start(({ finished }) => {
        if (finished) {
          setActiveCelebration(null);
        }
      });
    },
    [backdropOpacity, celebrationEffectsEnabled, isPremium, opacity, scale, translateY],
  );

  const value = useMemo<CelebrationContextValue>(
    () => ({
      triggerCelebration,
    }),
    [triggerCelebration],
  );

  return (
    <CelebrationContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        <View pointerEvents="none" style={styles.overlayContainer}>
          {activeCelebration ? (
            <>
              <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
              <Animated.View
                key={activeCelebration.id}
                style={[
                  styles.card,
                  activeCelebration.isPremium ? styles.cardPremium : styles.cardFree,
                  { opacity, transform: [{ translateY }, { scale }] },
                ]}
              >
                <Text style={styles.iconText}>
                  {activeCelebration.kind === "exam" ? "🏆" : "🎉"}
                </Text>
                <Text
                  style={[
                    styles.badgeText,
                    activeCelebration.isPremium ? styles.badgeTextPremium : styles.badgeTextFree,
                  ]}
                >
                  {activeCelebration.isPremium ? "MEGA CELEBRATION" : "GREAT JOB"}
                </Text>
                <Text style={styles.labelText}>{activeCelebration.label}</Text>
                <Text numberOfLines={2} style={styles.titleText}>
                  {activeCelebration.title}
                </Text>
                <Text style={styles.subtitleText}>{activeCelebration.subtitle}</Text>
              </Animated.View>
            </>
          ) : null}
        </View>
      </View>
    </CelebrationContext.Provider>
  );
};

export const useCelebration = (): CelebrationContextValue => {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error("useCelebration must be used within CelebrationProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 6, 23, 0.45)",
  },
  card: {
    width: "86%",
    maxWidth: 360,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: "center",
    shadowColor: "#020617",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  cardFree: {
    backgroundColor: "#0F1B33",
    borderWidth: 1,
    borderColor: "#2C4A73",
  },
  cardPremium: {
    backgroundColor: "#10263E",
    borderWidth: 1,
    borderColor: "#2E6B93",
  },
  iconText: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  badgeTextFree: {
    color: "#93C5FD",
  },
  badgeTextPremium: {
    color: "#67E8F9",
  },
  labelText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  titleText: {
    marginTop: 4,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitleText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: DESIGN.colors.textSecondary,
    textAlign: "center",
  },
});
