import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { analyzeMatch } from "./analyzer.js";
import type { MatchRequest } from "./models.js";
import { WaitlistStore, WaitlistValidationError, type WaitlistRequest } from "./waitlist.js";

const DEFAULT_PORT = 3000;

export function createCareerOsServer(waitlistStore = new WaitlistStore()) {
  return createServer(async (request, response) => {
    try {
      await route(request, response, waitlistStore);
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
