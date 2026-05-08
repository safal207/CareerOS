import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWaitlistLeads } from "../src/web/waitlistAdminClient.js";

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
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/waitlist");
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
