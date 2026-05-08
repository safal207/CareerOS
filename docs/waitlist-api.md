# Waitlist API

CareerOS includes a minimal backend capture endpoint for the funnel waitlist.

## Endpoint

```txt
POST /api/waitlist
```

## Request

```json
{
  "email": "user@example.com",
  "source": "funnel_frontend",
  "offer": "job_search_pack_19"
}
```

Required:

- `email`

Optional:

- `source`
- `offer`

## Response

```json
{
  "ok": true,
  "entry": {
    "email": "user@example.com",
    "source": "funnel_frontend",
    "offer": "job_search_pack_19",
    "created_at": "2026-05-08T00:00:00.000Z"
  }
}
```

## Storage

The MVP stores waitlist entries as JSONL.

Default path:

```txt
data/waitlist.jsonl
```

Override path:

```bash
CAREEROS_WAITLIST_PATH=/tmp/careeros-waitlist.jsonl npm run dev
```

## Why JSONL first

JSONL is enough for MVP validation:

- simple append-only capture;
- easy to inspect;
- easy to export;
- no database setup;
- can migrate later to SQLite, Postgres, Supabase, or CRM.

## Privacy note

Emails are sensitive user data. Production usage should add:

- explicit consent copy;
- unsubscribe path;
- retention policy;
- access controls;
- secure deployment storage.
