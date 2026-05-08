import { mkdir, appendFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface WaitlistRequest {
  email: string;
  source?: string;
  offer?: string;
}

export interface WaitlistEntry {
  email: string;
  source: string;
  offer: string;
  created_at: string;
}

export class WaitlistStore {
  constructor(private readonly filePath = process.env.CAREEROS_WAITLIST_PATH ?? "data/waitlist.jsonl") {}

  async add(request: WaitlistRequest): Promise<WaitlistEntry> {
    const email = normalizeEmail(request.email);

    if (!isValidEmail(email)) {
      throw new WaitlistValidationError("Invalid email address.");
    }

    const entry: WaitlistEntry = {
      email,
      source: cleanValue(request.source) ?? "web",
      offer: cleanValue(request.offer) ?? "job_search_pack_19",
      created_at: new Date().toISOString(),
    };

    await mkdir(dirname(this.filePath), { recursive: true });
    await appendFile(this.filePath, `${JSON.stringify(entry)}\n`, "utf8");

    return entry;
  }
}

export class WaitlistValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WaitlistValidationError";
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : undefined;
}
