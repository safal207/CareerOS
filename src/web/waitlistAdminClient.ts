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

export async function fetchWaitlistLeads(): Promise<WaitlistLeadsResult> {
  try {
    const response = await fetch("/api/waitlist");

    if (!response.ok) {
      return { ok: false, message: "Could not load waitlist leads." };
    }

    const data = (await response.json()) as WaitlistLeadsResponse;
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Could not reach the API. Start the backend and try again." };
  }
}
