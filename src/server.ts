import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { verifyAdminRequest } from "./adminAuth.js";
import { analyzeMatch } from "./analyzer.js";
import {
  CheckoutIntentStore,
  CheckoutIntentValidationError,
  type CheckoutIntentRequest,
} from "./checkoutIntent.js";
import type { MatchRequest } from "./models.js";
import { WaitlistStore, WaitlistValidationError, type WaitlistRequest } from "./waitlist.js";

const DEFAULT_PORT = 3000;
const DEFAULT_ALLOWED_ORIGINS = ["http://127.0.0.1:5173", "http://localhost:5173"];

export function createCareerOsServer(
  waitlistStore = new WaitlistStore(),
  checkoutIntentStore = new CheckoutIntentStore(),
) {
  return createServer(async (request, response) => {
    try {
      applyCorsHeaders(request, response);

      if ((request.method ?? "GET") === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }

      await route(request, response, waitlistStore, checkoutIntentStore);
    } catch (error) {
      sendJson(response, 500, {
        error: "internal_server_error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}

async function route(
  request: IncomingMessage,
  response: ServerResponse,
  waitlistStore: WaitlistStore,
  checkoutIntentStore: CheckoutIntentStore,
): Promise<void> {
  const method = request.method ?? "GET";
  const url = request.url ?? "/";

  if (method === "GET" && url === "/health") {
    sendJson(response, 200, { ok: true, service: "careeros" });
    return;
  }

  if (method === "POST" && url === "/api/matches") {
    const body = await readJson(request);

    if (!isMatchRequest(body)) {
      sendJson(response, 400, {
        error: "invalid_request",
        message: "Expected non-empty resume_text and vacancy_text strings.",
      });
      return;
    }

    const report = analyzeMatch(body.resume_text, body.vacancy_text);
    sendJson(response, 200, report);
    return;
  }

  if (method === "GET" && url === "/api/waitlist") {
    const auth = verifyAdminRequest(request);
    if (!auth.ok) {
      sendJson(response, 401, { error: "unauthorized", message: "Missing or invalid admin token." });
      return;
    }

    const entries = await waitlistStore.list();
    sendJson(response, 200, { count: entries.length, entries });
    return;
  }

  if (method === "POST" && url === "/api/waitlist") {
    const body = await readJson(request);

    if (!isWaitlistRequest(body)) {
      sendJson(response, 400, {
        error: "invalid_request",
        message: "Expected a non-empty email string.",
      });
      return;
    }

    try {
      const entry = await waitlistStore.add(body);
      sendJson(response, 201, { ok: true, entry });
    } catch (error) {
      if (error instanceof WaitlistValidationError) {
        sendJson(response, 400, { error: "invalid_email", message: error.message });
        return;
      }
      throw error;
    }
    return;
  }

  if (method === "GET" && url === "/api/checkout-intents") {
    const auth = verifyAdminRequest(request);
    if (!auth.ok) {
      sendJson(response, 401, { error: "unauthorized", message: "Missing or invalid admin token." });
      return;
    }

    const entries = await checkoutIntentStore.list();
    sendJson(response, 200, { count: entries.length, entries });
    return;
  }

  if (method === "POST" && url === "/api/checkout-intents") {
    const body = await readJson(request);

    if (!isCheckoutIntentRequest(body)) {
      sendJson(response, 400, {
        error: "invalid_request",
        message: "Expected a non-empty email string.",
      });
      return;
    }

    try {
      const entry = await checkoutIntentStore.add(body);
      sendJson(response, 201, { ok: true, entry });
    } catch (error) {
      if (error instanceof CheckoutIntentValidationError) {
        sendJson(response, 400, { error: "invalid_email", message: error.message });
        return;
      }
      throw error;
    }
    return;
  }

  sendJson(response, 404, { error: "not_found" });
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return null;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isMatchRequest(value: unknown): value is MatchRequest {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.resume_text === "string" &&
    record.resume_text.trim().length > 0 &&
    typeof record.vacancy_text === "string" &&
    record.vacancy_text.trim().length > 0
  );
}

function isWaitlistRequest(value: unknown): value is WaitlistRequest {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.email === "string" && record.email.trim().length > 0;
}

function isCheckoutIntentRequest(value: unknown): value is CheckoutIntentRequest {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.email === "string" && record.email.trim().length > 0;
}

function applyCorsHeaders(request: IncomingMessage, response: ServerResponse): void {
  const origin = request.headers.origin;
  if (!origin) return;

  if (getAllowedOrigins().includes(origin)) {
    response.setHeader("access-control-allow-origin", origin);
    response.setHeader("vary", "Origin");
    response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
    response.setHeader("access-control-allow-headers", "content-type,x-admin-token");
    response.setHeader("access-control-max-age", "86400");
  }
}

function getAllowedOrigins(): string[] {
  const configuredOrigins = (process.env.CAREEROS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  createCareerOsServer().listen(port, () => {
    console.log(`CareerOS API listening on http://127.0.0.1:${port}`);
  });
}
