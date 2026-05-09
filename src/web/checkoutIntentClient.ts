import { apiUrl } from "./apiBase.js";

export type CheckoutIntentResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function submitCheckoutIntent(email: string): Promise<CheckoutIntentResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.length === 0) {
    return { ok: false, message: "Enter your email to reserve the $19 pack." };
  }

  try {
    const response = await fetch(apiUrl("/api/checkout-intents"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        offer: "job_search_pack_19",
        price_usd: 19,
        source: "funnel_frontend",
      }),
    });

    if (!response.ok) {
      return { ok: false, message: "Could not reserve your checkout intent. Try again." };
    }

    return { ok: true, message: "Reserved. You are first in line for the $19 Job Search Pack." };
  } catch {
    return { ok: false, message: "Could not reach the API. Start the backend and try again." };
  }
}
