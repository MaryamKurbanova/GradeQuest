import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  clearBillingEntitlement,
  getBillingEntitlement,
  purchaseBillingPlan,
  restoreBillingPurchases,
  seedBillingEntitlement,
} from "../services/billing/BillingService";
import { getBillingProduct } from "../services/billing/BillingProducts";
import type { BillingEntitlement, BillingPlan } from "../services/billing/BillingTypes";
import { STORAGE_KEYS, readJson, writeJson } from "../../utils/storage";

type SubscriptionPlan = "free" | BillingPlan;

type BillingActionResult = {
  success: boolean;
  message: string;
};

type RestoreActionResult = {
  restored: boolean;
  message: string;
};

type SubscriptionContextValue = {
  isPremium: boolean;
  isProcessing: boolean;
  plan: SubscriptionPlan;
  expiresAt: string | null;
  lastBillingMessage: string | null;
  purchasePremium: (plan: Exclude<SubscriptionPlan, "free">) => Promise<BillingActionResult>;
  startMockPremium: (plan: Exclude<SubscriptionPlan, "free">) => void;
  restorePurchases: () => Promise<RestoreActionResult>;
  refreshSubscription: () => Promise<void>;
  clearPremium: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

type PersistedSubscription = {
  plan: SubscriptionPlan;
  expiresAt: string | null;
};

export const SubscriptionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastBillingMessage, setLastBillingMessage] = useState<string | null>(null);

  const applyEntitlementState = useCallback((entitlement: BillingEntitlement | null) => {
    if (!entitlement) {
      setPlan("free");
      setExpiresAt(null);
      return;
    }
    setPlan(entitlement.plan);
    setExpiresAt(entitlement.expiresAt);
  }, []);

  const refreshSubscription = useCallback(async () => {
    const activeEntitlement = await getBillingEntitlement();
    if (activeEntitlement) {
      applyEntitlementState(activeEntitlement);
      return;
    }

    // Backward compatibility for earlier persisted mock subscriptions.
    const legacy = await readJson<PersistedSubscription | null>(STORAGE_KEYS.subscription, null);
    if (legacy && (legacy.plan === "monthly" || legacy.plan === "yearly") && legacy.expiresAt) {
      const legacyExpiry = new Date(legacy.expiresAt);
      if (!Number.isNaN(legacyExpiry.getTime()) && legacyExpiry.getTime() > Date.now()) {
        const product = getBillingProduct(legacy.plan);
        const seeded = await seedBillingEntitlement({
          plan: legacy.plan,
          productId: product.productId,
          startedAt: new Date().toISOString(),
          expiresAt: legacy.expiresAt,
          source: "localReceipt",
        });
        applyEntitlementState(seeded);
        return;
      }
    }

    applyEntitlementState(null);
  }, [applyEntitlementState]);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      await refreshSubscription();
      if (isMounted) {
        setIsHydrated(true);
      }
    };

    void hydrate();
    return () => {
      isMounted = false;
    };
  }, [refreshSubscription]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void writeJson<PersistedSubscription>(STORAGE_KEYS.subscription, {
      plan,
      expiresAt,
    });
  }, [plan, expiresAt, isHydrated]);

  const purchasePremium = useCallback(
    async (nextPlan: Exclude<SubscriptionPlan, "free">): Promise<BillingActionResult> => {
      setIsProcessing(true);
      try {
        const result = await purchaseBillingPlan(nextPlan);
        applyEntitlementState(result.entitlement);
        setLastBillingMessage(result.message);
        return {
          success: result.success,
          message: result.message,
        };
      } catch {
        const message = "Unable to complete purchase. Please try again.";
        setLastBillingMessage(message);
        return {
          success: false,
          message,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [applyEntitlementState],
  );

  const restorePurchases = useCallback(async (): Promise<RestoreActionResult> => {
    setIsProcessing(true);
    try {
      const result = await restoreBillingPurchases();
      applyEntitlementState(result.entitlement);
      setLastBillingMessage(result.message);
      return {
        restored: result.restored,
        message: result.message,
      };
    } catch {
      const message = "Unable to restore purchases right now.";
      setLastBillingMessage(message);
      return {
        restored: false,
        message,
      };
    } finally {
      setIsProcessing(false);
    }
  }, [applyEntitlementState]);

  const clearPremium = useCallback(async () => {
    setIsProcessing(true);
    try {
      await clearBillingEntitlement();
      applyEntitlementState(null);
      setLastBillingMessage("Premium access removed on this device.");
    } finally {
      setIsProcessing(false);
    }
  }, [applyEntitlementState]);

  const startMockPremium = useCallback(
    (nextPlan: Exclude<SubscriptionPlan, "free">) => {
      void purchasePremium(nextPlan);
    },
    [purchasePremium],
  );

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      isPremium: plan !== "free",
      isProcessing,
      plan,
      expiresAt,
      lastBillingMessage,
      purchasePremium,
      startMockPremium,
      restorePurchases,
      refreshSubscription,
      clearPremium,
    }),
    [
      plan,
      expiresAt,
      isProcessing,
      lastBillingMessage,
      purchasePremium,
      startMockPremium,
      restorePurchases,
      refreshSubscription,
      clearPremium,
    ],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = (): SubscriptionContextValue => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
};
