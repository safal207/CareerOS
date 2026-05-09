import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { CheckoutIntentStore } from "../src/checkoutIntent.js";
import { createCareerOsServer } from "../src/server.js";
import { WaitlistStore } from "../src/waitlist.js";

describe("createCareerOsServer", () => {
  let tempDir: string | null = null;
  const originalAdminToken = process.env.CAREEROS_ADMIN_TOKEN;

  afterEach(async () => {
    process.env.CAREEROS_ADMIN_TOKEN = originalAdminToken;

    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  });

  it("creates a Node HTTP server instance", () => {
    const server = createCareerOsServer();

    expect(typeof server.listen).toBe("function");
    expect(typeof server.close).toBe("function");

    server.close();
  });

  it("accepts waitlist submissions through the API", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "careeros-api-"));
    const store = new WaitlistStore(join(tempDir, "waitlist.jsonl"));
    const server = createCareerOsServer(store);

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected TCP address");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/waitlist`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", source: "test", offer: "job_search_pack_19" }),
    });

    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.entry.email).toBe("user@example.com");
  });

  it("lists waitlist leads through the API when admin token is disabled", async () => {
    delete process.env.CAREEROS_ADMIN_TOKEN;
    tempDir = await mkdtemp(join(tmpdir(), "careeros-api-"));
    const store = new WaitlistStore(join(tempDir, "waitlist.jsonl"));
    await store.add({ email: "lead@example.com", source: "test" });
    const server = createCareerOsServer(store);

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected TCP address");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/waitlist`);

    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.count).toBe(1);
    expect(payload.entries[0].email).toBe("lead@example.com");
  });

  it("rejects waitlist lead listing without the admin token when configured", async () => {
    process.env.CAREEROS_ADMIN_TOKEN = "secret-token";
    tempDir = await mkdtemp(join(tmpdir(), "careeros-api-"));
    const store = new WaitlistStore(join(tempDir, "waitlist.jsonl"));
    const server = createCareerOsServer(store);

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected TCP address");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/waitlist`);

    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));

    expect(response.status).toBe(401);
  });

  it("lists waitlist leads with the admin token when configured", async () => {
    process.env.CAREEROS_ADMIN_TOKEN = "secret-token";
    tempDir = await mkdtemp(join(tmpdir(), "careeros-api-"));
    const store = new WaitlistStore(join(tempDir, "waitlist.jsonl"));
    await store.add({ email: "lead@example.com", source: "test" });
    const server = createCareerOsServer(store);

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected TCP address");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/waitlist`, {
      headers: { "x-admin-token": "secret-token" },
    });

    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.entries[0].email).toBe("lead@example.com");
  });

  it("accepts checkout intents through the API", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "careeros-api-"));
    const waitlistStore = new WaitlistStore(join(tempDir, "waitlist.jsonl"));
    const checkoutIntentStore = new CheckoutIntentStore(join(tempDir, "checkout-intents.jsonl"));
    const server = createCareerOsServer(waitlistStore, checkoutIntentStore);

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected TCP address");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/checkout-intents`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "buyer@example.com", source: "test", offer: "job_search_pack_19", price_usd: 19 }),
    });

    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.entry.email).toBe("buyer@example.com");
    expect(payload.entry.status).toBe("intent_created");
  });

  it("lists checkout intents with the admin token when configured", async () => {
    process.env.CAREEROS_ADMIN_TOKEN = "secret-token";
    tempDir = await mkdtemp(join(tmpdir(), "careeros-api-"));
    const waitlistStore = new WaitlistStore(join(tempDir, "waitlist.jsonl"));
    const checkoutIntentStore = new CheckoutIntentStore(join(tempDir, "checkout-intents.jsonl"));
    await checkoutIntentStore.add({ email: "buyer@example.com", source: "test" });
    const server = createCareerOsServer(waitlistStore, checkoutIntentStore);

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected TCP address");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/checkout-intents`, {
      headers: { "x-admin-token": "secret-token" },
    });

    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.count).toBe(1);
    expect(payload.entries[0].email).toBe("buyer@example.com");
  });

  it("rejects checkout intent listing without the admin token when configured", async () => {
    process.env.CAREEROS_ADMIN_TOKEN = "secret-token";
    tempDir = await mkdtemp(join(tmpdir(), "careeros-api-"));
    const waitlistStore = new WaitlistStore(join(tempDir, "waitlist.jsonl"));
    const checkoutIntentStore = new CheckoutIntentStore(join(tempDir, "checkout-intents.jsonl"));
    const server = createCareerOsServer(waitlistStore, checkoutIntentStore);

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected TCP address");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/checkout-intents`);

    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));

    expect(response.status).toBe(401);
  });
});
