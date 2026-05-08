export interface WaitlistLead {
  email: string;
  source: string;
  offer: string;
  created_at: string;
}

export interface WaitlistLeadsResponse {
  count: number;
  entries: WaitlistLead[];
}

export type WaitlistLeadsResult =
  | { ok: true; data: WaitlistLeadsResponse }
  | { ok: false; message: string };

export async function fetchWaitlistLeads(adminToken = ""): Promise<WaitlistLeadsResult> {
  try {
    const headers: Record<string, string> = {};
    const token = adminToken.trim();

    if (token.length > 0) {
      headers["x-admin-token"] = token;
    }

    const response = await fetch("/api/waitlist", { headers });

    if (response.status === 401) {
      return { ok: false, message: "Missing or invalid admin token." };
    }

    if (!response.ok) {
      return { ok: false, message: "Could not load waitlist leads." };
    }

    const data = (await response.json()) as WaitlistLeadsResponse;
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Could not reach the API. Start the backend and try again." };
  }
}
