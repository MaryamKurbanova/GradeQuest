import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS, readJson, writeJson } from "../../utils/storage";

type SubscriptionPlan = "free" | "monthly" | "yearly";

type SubscriptionContextValue = {
  isPremium: boolean;
  plan: SubscriptionPlan;
  expiresAt: string | null;
  startMockPremium: (plan: Exclude<SubscriptionPlan, "free">) => void;
  clearPremium: () => void;
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

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const persisted = await readJson<PersistedSubscription | null>(
        STORAGE_KEYS.subscription,
        null,
      );
      if (persisted && isMounted) {
        setPlan(persisted.plan);
        setExpiresAt(persisted.expiresAt);
      }
      if (isMounted) {
        setIsHydrated(true);
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void writeJson<PersistedSubscription>(STORAGE_KEYS.subscription, {
      plan,
      expiresAt,
    });
  }, [plan, expiresAt, isHydrated]);

  const startMockPremium = (nextPlan: Exclude<SubscriptionPlan, "free">) => {
    const months = nextPlan === "yearly" ? 12 : 1;
    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() + months);

    setPlan(nextPlan);
    setExpiresAt(expiration.toISOString());
  };

  const clearPremium = () => {
    setPlan("free");
    setExpiresAt(null);
  };

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      isPremium: plan !== "free",
      plan,
      expiresAt,
      startMockPremium,
      clearPremium,
    }),
    [plan, expiresAt],
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
