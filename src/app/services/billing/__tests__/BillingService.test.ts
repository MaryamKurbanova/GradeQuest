import {
  clearBillingEntitlement,
  getBillingEntitlement,
  purchaseBillingPlan,
  restoreBillingPurchases,
  seedBillingEntitlement,
} from "../BillingService";
import { BILLING_PRODUCTS } from "../BillingProducts";

describe("BillingService", () => {
  beforeEach(async () => {
    await clearBillingEntitlement();
  });

  afterEach(async () => {
    await clearBillingEntitlement();
  });

  it("purchases and stores entitlement", async () => {
    const purchase = await purchaseBillingPlan("monthly");
    expect(purchase.success).toBe(true);
    expect(purchase.entitlement?.plan).toBe("monthly");

    const entitlement = await getBillingEntitlement();
    expect(entitlement?.productId).toBe(BILLING_PRODUCTS.monthly.productId);
  });

  it("restores when active entitlement exists", async () => {
    await purchaseBillingPlan("yearly");
    const restored = await restoreBillingPurchases();
    expect(restored.restored).toBe(true);
    expect(restored.entitlement?.plan).toBe("yearly");
  });

  it("rejects expired seeded entitlements", async () => {
    const seeded = await seedBillingEntitlement({
      plan: "monthly",
      productId: BILLING_PRODUCTS.monthly.productId,
      startedAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-01-02T00:00:00.000Z",
      source: "localReceipt",
    });
    expect(seeded).toBeNull();

    const entitlement = await getBillingEntitlement();
    expect(entitlement).toBeNull();
  });
});
