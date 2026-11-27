import { describe, expect, it } from "vitest";
import { scanMessage, trustRisk } from "@/lib/scam";

const kinds = (t: string) => scanMessage(t).flags.map((f) => f.kind);

describe("chat scam detection", () => {
  it.each([
    ["Call me on 0803 123 4567", "phone"],
    ["+234 803-123-4567", "phone"],
    ["zero eight zero three one two three four five six seven", "phone"],
    ["email me at john.doe@gmail.com", "email"],
    ["john dot doe at gmail dot com", "email"],
    ["wa.me/2348031234567", "whatsapp"],
    ["Pay to GTB 0123456789", "bank_account"],
    ["visit mystore.com", "link"],
  ])("blocks %s", (text, kind) => {
    const r = scanMessage(text);
    expect(r.blocked).toBe(true);
    expect(kinds(text)).toContain(kind);
  });

  it("masks contact details but keeps the rest", () => {
    expect(scanMessage("Call me on 0803 123 4567 today").safeText).toBe("Call me on [number hidden] today");
  });

  it("warns without blocking on payment talk with no details", () => {
    const r = scanMessage("Just send it directly to my account, cheaper outside alaba");
    expect(r.blocked).toBe(false);
    expect(kinds("Just send it directly to my account, cheaper outside alaba")).toContain("off_platform_payment");
  });

  it.each(["Is size 42 available in brown?", "I can do 15000 for 2", "Order ALB-10482 hasn't arrived", "check tiktok.com/@alaba.ng/video/123"])("lets normal chat through: %s", (t) => {
    expect(scanMessage(t).flags).toHaveLength(0);
  });

  it("raises risk after 2 completed orders", () => {
    expect(trustRisk(1)).toBe("normal");
    expect(trustRisk(2)).toBe("elevated");
  });
});
