import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PREMIUM_PRICING } from "../app/constants/pricing";
import { useSubscription } from "../app/providers/SubscriptionProvider";
import { DESIGN } from "../app/theme/design";

type PlanKey = "monthly" | "yearly";

type PremiumFeature = {
  id: string;
  title: string;
  description: string;
};

const PLANS: {
  key: PlanKey;
  title: string;
  price: string;
  subtitle: string;
  badge?: string;
}[] = [
  {
    key: "monthly",
    title: PREMIUM_PRICING.monthly.label,
    price: PREMIUM_PRICING.monthly.displayPriceShort,
    subtitle: PREMIUM_PRICING.monthly.renewalText,
  },
  {
    key: "yearly",
    title: PREMIUM_PRICING.yearly.label,
    price: PREMIUM_PRICING.yearly.displayPriceShort,
    subtitle: PREMIUM_PRICING.yearly.renewalText,
    badge: "Best value",
  },
];

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: "p1",
    title: "Custom themes & personalization",
    description: "Pastel, gradient, vibrant themes plus custom course colors/icons.",
  },
  {
    id: "p2",
    title: "Advanced reminders",
    description: "Unlimited reminders, persistent nudges, and custom snooze timing.",
  },
  {
    id: "p3",
    title: "Extra gamification rewards",
    description: "Premium badges, visual unlocks, multipliers, and sticker rewards.",
  },
  {
    id: "p4",
    title: "Widgets & quick access",
    description: "Home widget with tasks, exams, streak, points, and quick add actions.",
  },
  {
    id: "p5",
    title: "Advanced progress tracking",
    description: "Weekly/monthly analytics, trend charts, and productive-day insights.",
  },
  {
    id: "p6",
    title: "Unlimited grade calculations",
    description: "Free gets 5 calculations/month; Premium removes the cap.",
  },
];

const PaywallScreen: React.FC = () => {
  const {
    isPremium,
    isProcessing,
    plan,
    expiresAt,
    lastBillingMessage,
    purchasePremium,
    restorePurchases,
    clearPremium,
  } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("yearly");

  useEffect(() => {
    if (plan === "monthly" || plan === "yearly") {
      setSelectedPlan(plan);
    }
  }, [plan]);

  const ctaText = useMemo(() => {
    if (isPremium) {
      return "Premium already active";
    }
    if (selectedPlan === "yearly") {
      return `Start Yearly Premium • ${PREMIUM_PRICING.yearly.displayPriceLong}`;
    }
    return `Start Monthly Premium • ${PREMIUM_PRICING.monthly.displayPriceLong}`;
  }, [isPremium, selectedPlan]);

  const onStartPremium = async () => {
    if (isPremium) {
      Alert.alert("Premium active", "Your premium access is already active on this device.");
      return;
    }

    const result = await purchasePremium(selectedPlan);
    if (result.success) {
      Alert.alert("Premium unlocked", result.message);
      return;
    }
    Alert.alert("Purchase failed", result.message);
  };

  const onRestorePurchases = async () => {
    if (isPremium) {
      Alert.alert("Already restored", "Your premium entitlement is already active.");
      return;
    }

    const result = await restorePurchases();
    Alert.alert(result.restored ? "Purchases restored" : "Nothing to restore", result.message);
  };

  const onManageSubscription = () => {
    if (!isPremium) {
      Alert.alert("No active subscription", "You are currently on the free plan.");
      return;
    }

    Alert.alert(
      "Manage subscription",
      `Plan: ${plan}\nExpires: ${expiresAt ? new Date(expiresAt).toLocaleDateString() : "N/A"}`,
      [
        { text: "Close", style: "cancel" },
        {
          text: "Switch to Free",
          style: "destructive",
          onPress: () => {
            void clearPremium();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Premium</Text>
        <Text style={styles.title}>Unlock full GradeQuest</Text>
        <Text style={styles.subtitle}>
          Get better focus, stronger habits, and unlimited tools to hit your goals.
        </Text>

        {isPremium ? (
          <View style={styles.activePlanCard}>
            <Text style={styles.activePlanTitle}>Premium is active</Text>
            <Text style={styles.activePlanText}>
              Current plan: {plan} {expiresAt ? `• Expires ${new Date(expiresAt).toLocaleDateString()}` : ""}
            </Text>
          </View>
        ) : null}

        <View style={styles.planList}>
          {PLANS.map((plan) => {
            const isSelected = plan.key === selectedPlan;
            return (
              <TouchableOpacity
                key={plan.key}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedPlan(plan.key)}
              >
                <View style={styles.planHeaderRow}>
                  <Text style={[styles.planTitle, isSelected && styles.planTitleSelected]}>
                    {plan.title}
                  </Text>
                  {plan.badge ? (
                    <View style={styles.valueBadge}>
                      <Text style={styles.valueBadgeText}>{plan.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                  {plan.price}
                </Text>
                <Text style={[styles.planSubtitle, isSelected && styles.planSubtitleSelected]}>
                  {plan.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Everything included</Text>
          {PREMIUM_FEATURES.map((feature) => (
            <View key={feature.id} style={styles.featureCard}>
              <View style={styles.featureBullet} />
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryCta, isProcessing && styles.primaryCtaDisabled]}
          onPress={() => {
            void onStartPremium();
          }}
          disabled={isProcessing}
        >
          <Text style={styles.primaryCtaText}>{isProcessing ? "Processing..." : ctaText}</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={[styles.secondaryAction, isProcessing && styles.secondaryActionDisabled]}
            onPress={() => {
              void onRestorePurchases();
            }}
            disabled={isProcessing}
          >
            <Text style={styles.secondaryActionText}>Restore Purchases</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryAction, isProcessing && styles.secondaryActionDisabled]}
            onPress={onManageSubscription}
            disabled={isProcessing}
          >
            <Text style={styles.secondaryActionText}>Manage Subscription</Text>
          </TouchableOpacity>
        </View>

        {lastBillingMessage ? <Text style={styles.messageText}>{lastBillingMessage}</Text> : null}

        <Text style={styles.legalText}>
          Subscription auto-renews unless canceled. Manage anytime in your device store settings.
        </Text>
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
    marginBottom: 14,
  },
  activePlanCard: {
    backgroundColor: "#DCFCE7",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  activePlanTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
  },
  activePlanText: {
    marginTop: 4,
    fontSize: 12,
    color: "#166534",
  },
  planList: {
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: DESIGN.colors.border,
  },
  planCardSelected: {
    borderColor: DESIGN.colors.primary,
    backgroundColor: DESIGN.colors.primarySoft,
  },
  planHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  planTitleSelected: {
    color: "#312E81",
  },
  planPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
  },
  planPriceSelected: {
    color: "#312E81",
  },
  planSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },
  planSubtitleSelected: {
    color: "#4338CA",
  },
  valueBadge: {
    backgroundColor: "#DDD6FE",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  valueBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6D28D9",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
    marginBottom: 10,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    marginBottom: 9,
    shadowColor: "#0B1324",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  featureBullet: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: DESIGN.colors.primary,
    marginTop: 6,
    marginRight: 10,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DESIGN.colors.textPrimary,
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  primaryCta: {
    backgroundColor: DESIGN.colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryCtaDisabled: {
    opacity: 0.6,
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: DESIGN.colors.border,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  secondaryActionDisabled: {
    opacity: 0.6,
  },
  secondaryActionText: {
    color: DESIGN.colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  legalText: {
    marginTop: 12,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
    textAlign: "center",
  },
  messageText: {
    marginTop: 10,
    fontSize: 12,
    textAlign: "center",
    color: "#64748B",
  },
});

export default PaywallScreen;
