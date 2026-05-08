import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createCareerOsServer } from "../src/server.js";
import { WaitlistStore } from "../src/waitlist.js";

describe("createCareerOsServer", () => {
  let tempDir: string | null = null;

  afterEach(async () => {
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

  it("lists waitlist leads through the API", async () => {
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
});
