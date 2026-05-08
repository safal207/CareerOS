# Waitlist API

CareerOS includes a minimal backend capture endpoint for the funnel waitlist.

## Create waitlist lead

```txt
POST /api/waitlist
```

### Request

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

### Response

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

## List waitlist leads

```txt
GET /api/waitlist
```

### Response

```json
{
  "count": 1,
  "entries": [
    {
      "email": "user@example.com",
      "source": "funnel_frontend",
      "offer": "job_search_pack_19",
      "created_at": "2026-05-08T00:00:00.000Z"
    }
  ]
}
```

Entries are returned newest first.

## Local examples

Create lead:

```bash
curl -X POST http://127.0.0.1:3000/api/waitlist \
  -H 'content-type: application/json' \
  -d '{"email":"user@example.com","source":"funnel_frontend","offer":"job_search_pack_19"}'
```

List leads:

```bash
curl http://127.0.0.1:3000/api/waitlist
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

## Admin/security note

`GET /api/waitlist` is an MVP admin endpoint for local validation only.

Production usage must add:

- authentication;
- authorization;
- audit logging;
- rate limits;
- secure deployment storage;
- export controls.

## Privacy note

Emails are sensitive user data. Production usage should add:

- explicit consent copy;
- unsubscribe path;
- retention policy;
- access controls;
- secure deployment storage.
