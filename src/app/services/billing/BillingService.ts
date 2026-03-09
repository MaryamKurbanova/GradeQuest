import { STORAGE_KEYS, readJson, writeJson } from "../../../utils/storage";
import { getBillingProduct } from "./BillingProducts";
import type {
  BillingEntitlement,
  BillingPlan,
  BillingPurchaseResult,
  BillingRestoreResult,
} from "./BillingTypes";

type PersistedBillingState = {
  entitlement: BillingEntitlement | null;
  updatedAt: string | null;
};

const DEFAULT_BILLING_STATE: PersistedBillingState = {
  entitlement: null,
  updatedAt: null,
};

const isEntitlementActive = (entitlement: BillingEntitlement | null): boolean => {
  if (!entitlement) {
    return false;
  }
  const expiresAt = new Date(entitlement.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    return false;
  }
  return expiresAt.getTime() > Date.now();
};

const addMonths = (baseDate: Date, months: number): Date => {
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const persistEntitlement = async (entitlement: BillingEntitlement | null): Promise<void> => {
  await writeJson<PersistedBillingState>(STORAGE_KEYS.billingState, {
    entitlement,
    updatedAt: new Date().toISOString(),
  });
};

export const getBillingEntitlement = async (): Promise<BillingEntitlement | null> => {
  const persisted = await readJson<PersistedBillingState>(
    STORAGE_KEYS.billingState,
    DEFAULT_BILLING_STATE,
  );
  const entitlement = persisted.entitlement ?? null;
  if (isEntitlementActive(entitlement)) {
    return entitlement;
  }

  if (entitlement) {
    await persistEntitlement(null);
  }
  return null;
};

export const purchaseBillingPlan = async (plan: BillingPlan): Promise<BillingPurchaseResult> => {
  const product = getBillingProduct(plan);
  const startedAt = new Date();
  const months = plan === "yearly" ? 12 : 1;
  const expiresAt = addMonths(startedAt, months);

  const entitlement: BillingEntitlement = {
    plan,
    productId: product.productId,
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    source: "localReceipt",
  };

  await persistEntitlement(entitlement);
  return {
    success: true,
    entitlement,
    message: `${product.label} premium activated.`,
  };
};

export const restoreBillingPurchases = async (): Promise<BillingRestoreResult> => {
  const entitlement = await getBillingEntitlement();
  if (!entitlement) {
    return {
      restored: false,
      entitlement: null,
      message: "No active purchases found to restore.",
    };
  }

  return {
    restored: true,
    entitlement,
    message: "Premium purchase restored successfully.",
  };
};

export const clearBillingEntitlement = async (): Promise<void> => {
  await persistEntitlement(null);
};

export const seedBillingEntitlement = async (
  entitlement: BillingEntitlement,
): Promise<BillingEntitlement | null> => {
  if (!isEntitlementActive(entitlement)) {
    await persistEntitlement(null);
    return null;
  }

  await persistEntitlement(entitlement);
  return entitlement;
};
