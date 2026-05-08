# Local MVP Runbook

This runbook starts the full CareerOS MVP locally:

```txt
Backend API -> Vite frontend -> Funnel -> Waitlist capture -> Admin dashboard
```

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

Copy the example file:

```bash
cp .env.example .env
```

For local validation, either leave the admin token empty or set it explicitly:

```bash
CAREEROS_ADMIN_TOKEN=change-me
```

## 3. Start the backend API

```bash
npm run dev
```

Default backend URL:

```txt
http://127.0.0.1:3000
```

Health check:

```bash
curl http://127.0.0.1:3000/health
```

## 4. Start the frontend

In another terminal:

```bash
npm run dev:web
```

Default frontend URL:

```txt
http://127.0.0.1:5173
```

The Vite dev server proxies these routes to the backend:

- `/api/*`
- `/health`

## 5. Run the funnel

Open:

```txt
http://127.0.0.1:5173
```

Use the page to:

- run the free fit audit;
- join the waitlist;
- reserve interest in the $19 Job Search Pack.

## 6. Inspect leads

Open:

```txt
http://127.0.0.1:5173/admin
```

If `CAREEROS_ADMIN_TOKEN` is set, enter the same token in the admin token field.

The dashboard reads:

```txt
GET /api/waitlist
```

The backend stores leads in JSONL:

```txt
data/waitlist.jsonl
```

## 7. Manual API checks

Create a lead:

```bash
curl -X POST http://127.0.0.1:3000/api/waitlist \
  -H 'content-type: application/json' \
  -d '{"email":"user@example.com","source":"manual_curl","offer":"job_search_pack_19"}'
```

List leads without token protection:

```bash
curl http://127.0.0.1:3000/api/waitlist
```

List leads with token protection:

```bash
curl http://127.0.0.1:3000/api/waitlist \
  -H 'x-admin-token: change-me'
```

## 8. Build and test

```bash
npm run build
npm test
```

## Deployment notes

Before public deployment, add:

- HTTPS;
- real authentication;
- role-based authorization;
- secure persistent storage;
- rate limiting;
- audit logs;
- email consent and unsubscribe flow;
- production-grade secret management.
