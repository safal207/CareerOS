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

Start the API:

```bash
npm run dev
```

Start the frontend:

```bash
npm run dev:web
```

Open:

```txt
http://127.0.0.1:5173/admin
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

## Security note

This is an MVP/local admin dashboard.

Do not expose it publicly without adding:

- authentication;
- authorization;
- audit logging;
- rate limiting;
- secure storage;
- environment-specific admin access controls.

## Product role

The dashboard closes the first operator loop:

```txt
Free Fit Audit -> Waitlist Form -> JSONL lead capture -> Admin dashboard
```

This makes the funnel measurable before adding payment, CRM, or email automation.
