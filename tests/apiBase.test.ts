import { describe, expect, it } from "vitest";
import { apiUrl } from "../src/web/apiBase.js";

describe("apiUrl", () => {
  it("uses relative paths when VITE_API_BASE_URL is not set", () => {
    expect(apiUrl("/api/waitlist")).toBe("/api/waitlist");
  });

  it("uses the configured remote backend URL", () => {
    import.meta.env.VITE_API_BASE_URL = "https://careeros-api.example.com/";

    expect(apiUrl("/api/waitlist")).toBe("https://careeros-api.example.com/api/waitlist");
    expect(apiUrl("api/checkout-intents")).toBe("https://careeros-api.example.com/api/checkout-intents");

    delete import.meta.env.VITE_API_BASE_URL;
  });
});
