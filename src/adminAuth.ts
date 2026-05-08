import type { IncomingMessage } from "node:http";

export interface AdminAuthResult {
  ok: boolean;
  mode: "disabled" | "token";
}

export function verifyAdminRequest(request: IncomingMessage): AdminAuthResult {
  const expectedToken = process.env.CAREEROS_ADMIN_TOKEN?.trim();

  if (!expectedToken) {
    return { ok: true, mode: "disabled" };
  }

  const providedToken = request.headers["x-admin-token"];
  const token = Array.isArray(providedToken) ? providedToken[0] : providedToken;

  return { ok: token === expectedToken, mode: "token" };
}
