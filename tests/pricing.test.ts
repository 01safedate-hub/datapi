import { describe, expect, it } from "vitest";
import { quoteShipment } from "@/lib/delivery";
import { quote, wholesaleUnitKobo, type QuoteLine } from "@/lib/pricing";
import { parseVideoLink } from "@/lib/video";

const line = (o: Partial<QuoteLine>): QuoteLine => ({ source: "local", storeId: "str_alaba", unitPriceKobo: 1_000_000, wholesale: [], unitShippingKobo: 0, estWeightKg: 1, quantity: 1, freeDelivery: false, ...o });

describe("wholesale tiers", () => {
  const tiers = [{ minQty: 10, discount: 0.05 }, { minQty: 50, discount: 0.1 }];
  it("uses the deepest qualifying tier", () => {
    expect(wholesaleUnitKobo(1_000_000, tiers, 9)).toBe(1_000_000);
    expect(wholesaleUnitKobo(1_000_000, tiers, 10)).toBe(950_000);
    expect(wholesaleUnitKobo(1_000_000, tiers, 50)).toBe(900_000);
  });
});

describe("multi-seller delivery", () => {
  it("sums one shipment per store", () => {
    const q = quote([line({ storeId: "str_kora" }), line({ storeId: "str_aba" })], { state: "Lagos", carrier: "gig", method: "door" });
    expect(q.stores).toHaveLength(2);
    expect(q.localDeliveryKobo).toBe(q.stores[0]!.deliveryKobo + q.stores[1]!.deliveryKobo);
  });

  it("charges nothing for free-delivery items", () => {
    const q = quote([line({ storeId: "str_kora", freeDelivery: true })], { state: "Kano", carrier: "jumia", method: "door" });
    expect(q.localDeliveryKobo).toBe(0);
    expect(q.stores[0]!.free).toBe(true);
  });

  it("prices national delivery above same-state", () => {
    const base = { carrier: "gig" as const, method: "door" as const, chargeableKg: 2, allFreeDelivery: false, storeSubtotalKobo: 0, freeOverKobo: null };
    expect(quoteShipment({ ...base, originState: "Lagos", destState: "Kano" }).priceKobo).toBeGreaterThan(quoteShipment({ ...base, originState: "Lagos", destState: "Lagos" }).priceKobo);
  });

  it("caps loyalty at the items total", () => {
    const q = quote([line({})], null, null, 99_999_999);
    expect(q.loyaltyKobo).toBe(q.itemsKobo);
  });
});

describe("video links", () => {
  it.each(["https://www.tiktok.com/@alaba.ng/video/7441234567890123456", "https://vm.tiktok.com/ZMabc123/", "https://www.instagram.com/reel/C9x1AlabaDemo/"])("accepts %s", (u) => expect(parseVideoLink(u)).not.toBeNull());
  it.each(["https://youtube.com/watch?v=x", "http://www.tiktok.com/@a/video/12345678", "https://tiktok.com.evil.ng/@a/video/12345678", "https://user:pw@www.instagram.com/reel/abcdef/", "javascript:alert(1)"])("rejects %s", (u) => expect(parseVideoLink(u)).toBeNull());
  it("strips tracking params", () => expect(parseVideoLink("https://www.instagram.com/reel/C9x1AlabaDemo/?igsh=abc")?.url).toBe("https://www.instagram.com/reel/C9x1AlabaDemo/"));
});
