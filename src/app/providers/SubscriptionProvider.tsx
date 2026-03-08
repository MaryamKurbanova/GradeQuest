import React, { createContext, useContext, useMemo, useState } from "react";

type SubscriptionPlan = "free" | "monthly" | "yearly";

type SubscriptionContextValue = {
  isPremium: boolean;
  plan: SubscriptionPlan;
  expiresAt: string | null;
  startMockPremium: (plan: Exclude<SubscriptionPlan, "free">) => void;
  clearPremium: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export const SubscriptionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

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
