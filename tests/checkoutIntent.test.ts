import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { CheckoutIntentStore } from "../src/checkoutIntent.js";

let tempDir: string | null = null;

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
});

describe("CheckoutIntentStore", () => {
  it("appends checkout intents as JSONL", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "careeros-checkout-"));
    const filePath = join(tempDir, "checkout-intents.jsonl");
    const store = new CheckoutIntentStore(filePath);

    const entry = await store.add({
      email: "BUYER@Example.COM",
      source: "test",
      offer: "job_search_pack_19",
      price_usd: 19,
    });

    expect(entry.email).toBe("buyer@example.com");
    expect(entry.offer).toBe("job_search_pack_19");
    expect(entry.price_usd).toBe(19);
    expect(entry.status).toBe("intent_created");

    const lines = (await readFile(filePath, "utf8")).trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({ email: "buyer@example.com" });
  });

  it("lists checkout intents newest first", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "careeros-checkout-"));
    const store = new CheckoutIntentStore(join(tempDir, "checkout-intents.jsonl"));

    await store.add({ email: "first@example.com" });
    await store.add({ email: "second@example.com" });

    const entries = await store.list();

    expect(entries).toHaveLength(2);
    expect(entries[0]?.email).toBe("second@example.com");
    expect(entries[1]?.email).toBe("first@example.com");
  });

  it("returns empty list when checkout file does not exist", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "careeros-checkout-"));
    const store = new CheckoutIntentStore(join(tempDir, "missing.jsonl"));

    await expect(store.list()).resolves.toEqual([]);
  });

  it("rejects invalid emails", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "careeros-checkout-"));
    const store = new CheckoutIntentStore(join(tempDir, "checkout-intents.jsonl"));

    await expect(store.add({ email: "bad-email" })).rejects.toThrow("Invalid email address");
  });
});
