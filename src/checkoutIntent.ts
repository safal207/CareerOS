import { mkdir, appendFile, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { isValidEmail, normalizeEmail } from "./waitlist.js";

export interface CheckoutIntentRequest {
  email: string;
  offer?: string;
  price_usd?: number;
  source?: string;
}

export interface CheckoutIntentEntry {
  email: string;
  offer: string;
  price_usd: number;
  source: string;
  status: "intent_created";
  created_at: string;
}

interface IndexedCheckoutIntentEntry {
  entry: CheckoutIntentEntry;
  index: number;
}

export class CheckoutIntentStore {
  constructor(private readonly filePath = process.env.CAREEROS_CHECKOUT_INTENTS_PATH ?? "data/checkout-intents.jsonl") {}

  async add(request: CheckoutIntentRequest): Promise<CheckoutIntentEntry> {
    const email = normalizeEmail(request.email);

    if (!isValidEmail(email)) {
      throw new CheckoutIntentValidationError("Invalid email address.");
    }

    const entry: CheckoutIntentEntry = {
      email,
      offer: cleanValue(request.offer) ?? "job_search_pack_19",
      price_usd: normalizePrice(request.price_usd),
      source: cleanValue(request.source) ?? "funnel_frontend",
      status: "intent_created",
      created_at: new Date().toISOString(),
    };

    await mkdir(dirname(this.filePath), { recursive: true });
    await appendFile(this.filePath, `${JSON.stringify(entry)}\n`, "utf8");

    return entry;
  }

  async list(): Promise<CheckoutIntentEntry[]> {
    try {
      const content = await readFile(this.filePath, "utf8");
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line, index): IndexedCheckoutIntentEntry => ({ entry: JSON.parse(line) as CheckoutIntentEntry, index }))
        .sort((left, right) => {
          const dateOrder = right.entry.created_at.localeCompare(left.entry.created_at);
          return dateOrder === 0 ? right.index - left.index : dateOrder;
        })
        .map(({ entry }) => entry);
    } catch (error) {
      if (isFileNotFound(error)) return [];
      throw error;
    }
  }
}

export class CheckoutIntentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutIntentValidationError";
  }
}

function normalizePrice(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 19;
  }

  return Math.round(value * 100) / 100;
}

function cleanValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : undefined;
}

function isFileNotFound(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
