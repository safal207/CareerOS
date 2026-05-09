import { apiUrl } from "./apiBase.js";

export type WaitlistSubmitResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function submitWaitlistEmail(email: string): Promise<WaitlistSubmitResult> {
  const normalizedEmail = email.trim();

  if (normalizedEmail.length === 0) {
    return { ok: false, message: "Enter your email to join the launch list." };
  }

  try {
    const response = await fetch(apiUrl("/api/waitlist"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        source: "funnel_frontend",
        offer: "job_search_pack_19",
      }),
    });

    if (!response.ok) {
      return { ok: false, message: "Could not save yet. Check the email and try again." };
    }

    return { ok: true, message: "You are on the launch list. Backend capture confirmed." };
  } catch {
    return { ok: false, message: "Could not reach the API. Start the backend and try again." };
  }
}
