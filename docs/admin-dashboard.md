# Admin Dashboard

CareerOS includes a minimal MVP admin dashboard for viewing captured waitlist leads.

## Route

```txt
/admin
```

## What it shows

- total captured leads;
- latest source;
- primary offer;
- email;
- source;
- offer;
- created timestamp.

## How to run locally

Start the API without admin protection:

```bash
npm run dev
```

Start the API with admin token protection:

```bash
CAREEROS_ADMIN_TOKEN=change-me npm run dev
```

Start the frontend:

```bash
npm run dev:web
```

Open:

```txt
http://127.0.0.1:5173/admin
```

If `CAREEROS_ADMIN_TOKEN` is set, enter the same token in the dashboard token field. The UI stores it in browser localStorage and sends it as:

```txt
x-admin-token: change-me
```

## Data source

The dashboard reads from:

```txt
GET /api/waitlist
```

The backend reads JSONL entries from:

```txt
data/waitlist.jsonl
```

## API auth behavior

When `CAREEROS_ADMIN_TOKEN` is not set, `GET /api/waitlist` remains open for local MVP validation.

When `CAREEROS_ADMIN_TOKEN` is set, `GET /api/waitlist` requires:

```txt
x-admin-token: <token>
```

Invalid or missing token returns:

```txt
401 unauthorized
```

## Security note

This is still an MVP/local admin dashboard.

Do not expose it publicly without adding:

- HTTPS-only deployment;
- real authentication;
- role-based authorization;
- audit logging;
- rate limiting;
- secure storage;
- environment-specific admin access controls;
- no long-lived secrets in browser storage for production.

## Product role

The dashboard closes the first operator loop:

```txt
Free Fit Audit -> Waitlist Form -> JSONL lead capture -> Admin dashboard
```

This makes the funnel measurable before adding payment, CRM, or email automation.
