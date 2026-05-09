import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCheckoutIntents, fetchWaitlistLeads } from "../src/web/waitlistAdminClient.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchWaitlistLeads", () => {
  it("loads waitlist leads from the backend", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ count: 1, entries: [{ email: "lead@example.com", source: "test", offer: "job_search_pack_19", created_at: "2026-05-08T00:00:00.000Z" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await fetchWaitlistLeads();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.count).toBe(1);
      expect(result.data.entries[0]?.email).toBe("lead@example.com");
    }
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/waitlist", { headers: {} });
  });

  it("sends the admin token header when provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ count: 0, entries: [] }), { status: 200 }));

    const result = await fetchWaitlistLeads("secret-token");

    expect(result.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/waitlist", {
      headers: { "x-admin-token": "secret-token" },
    });
  });

  it("returns a specific error for unauthorized responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 401 }));

    const result = await fetchWaitlistLeads("wrong-token");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("admin token");
    }
  });

  it("returns a user-facing error when the backend fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 500 }));

    const result = await fetchWaitlistLeads();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("Could not load");
    }
  });
});

describe("fetchCheckoutIntents", () => {
  it("loads checkout intents from the backend", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ count: 1, entries: [{ email: "buyer@example.com", source: "test", offer: "job_search_pack_19", price_usd: 19, status: "intent_created", created_at: "2026-05-08T00:00:00.000Z" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await fetchCheckoutIntents("secret-token");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.count).toBe(1);
      expect(result.data.entries[0]?.email).toBe("buyer@example.com");
    }
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/checkout-intents", {
      headers: { "x-admin-token": "secret-token" },
    });
  });

  it("returns a user-facing checkout intent error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 500 }));

    const result = await fetchCheckoutIntents();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("checkout intents");
    }
  });
});
