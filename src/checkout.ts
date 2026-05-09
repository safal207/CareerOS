import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface CheckoutIntentRequest {
  email: string;
  offer?: string;
  price_cents?: number;
  currency?: string;
  source?: string;
}

export interface CheckoutIntentEntry {
  email: string;
  offer: string;
  price_cents: number;
  currency: string;
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
      price_cents: normalizePrice(request.price_cents),
      currency: normalizeCurrency(request.currency),
      source: cleanValue(request.source) ?? "checkout_stub",
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

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePrice(priceCents: number | undefined): number {
  return Number.isInteger(priceCents) && priceCents && priceCents > 0 ? priceCents : 1900;
}

function normalizeCurrency(currency: string | undefined): string {
  return cleanValue(currency)?.toUpperCase() ?? "USD";
}

function cleanValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : undefined;
}

function isFileNotFound(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
