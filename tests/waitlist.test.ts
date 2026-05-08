import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { WaitlistStore, isValidEmail, normalizeEmail } from "../src/waitlist.js";

let tempDir: string | null = null;

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = null;
  }
});

describe("waitlist utilities", () => {
  it("normalizes email addresses", () => {
    expect(normalizeEmail("  USER@Example.COM  ")).toBe("user@example.com");
  });

  it("validates email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });
});

describe("WaitlistStore", () => {
  it("appends waitlist entries as JSONL", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "careeros-waitlist-"));
    const filePath = join(tempDir, "waitlist.jsonl");
    const store = new WaitlistStore(filePath);

    const entry = await store.add({
      email: "USER@Example.COM",
      source: "test",
      offer: "job_search_pack_19",
    });

    expect(entry.email).toBe("user@example.com");
    expect(entry.source).toBe("test");
    expect(entry.offer).toBe("job_search_pack_19");

    const lines = (await readFile(filePath, "utf8")).trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({ email: "user@example.com" });
  });

  it("rejects invalid email addresses", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "careeros-waitlist-"));
    const store = new WaitlistStore(join(tempDir, "waitlist.jsonl"));

    await expect(store.add({ email: "bad-email" })).rejects.toThrow("Invalid email address");
  });
});
