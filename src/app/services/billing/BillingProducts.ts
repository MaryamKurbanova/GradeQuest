import { PREMIUM_PRICING } from "../../constants/pricing";
import type { BillingPlan } from "./BillingTypes";

export type BillingProduct = {
  plan: BillingPlan;
  productId: string;
  label: string;
  displayPrice: string;
};

export const BILLING_PRODUCTS: Record<BillingPlan, BillingProduct> = {
  monthly: {
    plan: "monthly",
    productId: PREMIUM_PRICING.monthly.productId,
    label: PREMIUM_PRICING.monthly.label,
    displayPrice: PREMIUM_PRICING.monthly.displayPriceLong,
  },
  yearly: {
    plan: "yearly",
    productId: PREMIUM_PRICING.yearly.productId,
    label: PREMIUM_PRICING.yearly.label,
    displayPrice: PREMIUM_PRICING.yearly.displayPriceLong,
  },
};

export const getBillingProduct = (plan: BillingPlan): BillingProduct => {
  return BILLING_PRODUCTS[plan];
};

export const getPlanByProductId = (productId: string): BillingPlan | null => {
  if (productId === BILLING_PRODUCTS.monthly.productId) {
    return "monthly";
  }
  if (productId === BILLING_PRODUCTS.yearly.productId) {
    return "yearly";
  }
  return null;
};
