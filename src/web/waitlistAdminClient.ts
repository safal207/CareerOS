export interface WaitlistLead {
  email: string;
  source: string;
  offer: string;
  created_at: string;
}

export interface CheckoutIntentLead {
  email: string;
  offer: string;
  price_usd: number;
  source: string;
  status: "intent_created";
  created_at: string;
}

export interface WaitlistLeadsResponse {
  count: number;
  entries: WaitlistLead[];
}

export interface CheckoutIntentsResponse {
  count: number;
  entries: CheckoutIntentLead[];
}

export type WaitlistLeadsResult =
  | { ok: true; data: WaitlistLeadsResponse }
  | { ok: false; message: string };

export type CheckoutIntentsResult =
  | { ok: true; data: CheckoutIntentsResponse }
  | { ok: false; message: string };

export async function fetchWaitlistLeads(adminToken = ""): Promise<WaitlistLeadsResult> {
  const result = await fetchAdminJson<WaitlistLeadsResponse>("/api/waitlist", adminToken, "Could not load waitlist leads.");
  return result;
}

export async function fetchCheckoutIntents(adminToken = ""): Promise<CheckoutIntentsResult> {
  const result = await fetchAdminJson<CheckoutIntentsResponse>(
    "/api/checkout-intents",
    adminToken,
    "Could not load checkout intents.",
  );
  return result;
}

async function fetchAdminJson<T>(url: string, adminToken: string, fallbackMessage: string): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const headers: Record<string, string> = {};
    const token = adminToken.trim();

    if (token.length > 0) {
      headers["x-admin-token"] = token;
    }

    const response = await fetch(url, { headers });

    if (response.status === 401) {
      return { ok: false, message: "Missing or invalid admin token." };
    }

    if (!response.ok) {
      return { ok: false, message: fallbackMessage };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Could not reach the API. Start the backend and try again." };
  }
}
