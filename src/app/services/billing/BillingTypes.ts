export type BillingPlan = "monthly" | "yearly";

export type BillingEntitlement = {
  plan: BillingPlan;
  productId: string;
  startedAt: string;
  expiresAt: string;
  source: "localReceipt";
};

export type BillingPurchaseResult = {
  success: boolean;
  entitlement: BillingEntitlement | null;
  message: string;
};

export type BillingRestoreResult = {
  restored: boolean;
  entitlement: BillingEntitlement | null;
  message: string;
};
