export const PREMIUM_PRICING = {
  monthly: {
    label: "Monthly",
    displayPriceShort: "$5.99/mo",
    displayPriceLong: "$5.99/month",
    renewalText: "Billed every month",
    productId: "gradequest.premium.monthly",
  },
  yearly: {
    label: "Yearly",
    displayPriceShort: "$39.99/yr",
    displayPriceLong: "$39.99/year",
    renewalText: "Billed every year",
    productId: "gradequest.premium.yearly",
  },
} as const;

export const FREE_TIER_LIMITS = {
  gradeCalculatorMonthlyEntries: 5,
} as const;
