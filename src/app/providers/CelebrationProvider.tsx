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
  const translateY = useRef(new Animated.Value(-14)).current;
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
      const label = input.kind === "exam" ? "Exam Completed" : "Assignment Completed";
      const subtitle = isPremium
        ? `Excellent work. +${awardedPoints} XP with Premium boost.`
        : `Excellent work. +${awardedPoints} XP earned.`;

      setActiveCelebration({
        id: `${Date.now()}`,
        label,
        title: input.title,
        subtitle,
        isPremium,
      });

      opacity.setValue(0);
      translateY.setValue(-14);

      if (activeAnimation.current) {
        activeAnimation.current.stop();
      }

      const animation = Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1300),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -12,
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
    [celebrationEffectsEnabled, isPremium, opacity, translateY],
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
            <Animated.View
              key={activeCelebration.id}
              style={[
                styles.card,
                activeCelebration.isPremium ? styles.cardPremium : styles.cardFree,
                { opacity, transform: [{ translateY }] },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  activeCelebration.isPremium ? styles.badgeTextPremium : styles.badgeTextFree,
                ]}
              >
                {activeCelebration.isPremium ? "PREMIUM CELEBRATION" : "MOTIVATION BOOST"}
              </Text>
              <Text style={styles.labelText}>{activeCelebration.label}</Text>
              <Text numberOfLines={1} style={styles.titleText}>
                {activeCelebration.title}
              </Text>
              <Text style={styles.subtitleText}>{activeCelebration.subtitle}</Text>
            </Animated.View>
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
    top: 12,
    left: 12,
    right: 12,
    zIndex: 1000,
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#0B1324",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardFree: {
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  cardPremium: {
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  badgeTextFree: {
    color: "#1D4ED8",
  },
  badgeTextPremium: {
    color: "#7C3AED",
  },
  labelText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  titleText: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  subtitleText: {
    marginTop: 5,
    fontSize: 12,
    color: "#334155",
  },
});
