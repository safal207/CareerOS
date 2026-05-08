import { afterEach, describe, expect, it, vi } from "vitest";
import { submitWaitlistEmail } from "../src/web/waitlistClient.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("submitWaitlistEmail", () => {
  it("rejects empty emails without calling fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await submitWaitlistEmail("   ");

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Enter your email");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("submits waitlist payload to the backend", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 201 }));

    const result = await submitWaitlistEmail("user@example.com");

    expect(result.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/waitlist",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
