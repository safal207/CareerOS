# Backend Deployment

This guide deploys the CareerOS Node API so the GitHub Pages frontend can capture waitlist leads and `$19 Job Search Pack` checkout intents.

## What the backend provides

```txt
GET  /health
POST /api/matches
POST /api/waitlist
GET  /api/waitlist
POST /api/checkout-intents
GET  /api/checkout-intents
```

The admin read endpoints are protected when `CAREEROS_ADMIN_TOKEN` is set.

## Render Blueprint path

The repository includes a Render Blueprint file:

```txt
render.yaml
```

It defines one Docker web service:

```txt
careerOS API -> Dockerfile -> /health
```

Deploy steps:

1. Merge the PR that adds `render.yaml`.
2. In Render, create a new Blueprint from this GitHub repository.
3. Set `CAREEROS_ADMIN_TOKEN` when Render asks for the unsynced secret value.
4. Deploy the service.
5. Copy the public backend URL, for example:

```txt
https://careeros-api.onrender.com
```

6. In GitHub, set the repository variable:

```txt
VITE_API_BASE_URL=https://careeros-api.onrender.com
```

7. Re-run the GitHub Pages workflow.

## Required environment variables

For Render Blueprint deployment, most values are already defined in `render.yaml`.

Required secret:

```txt
CAREEROS_ADMIN_TOKEN=<strong-secret-token>
```

Configured defaults:

```txt
PORT=10000
CAREEROS_WAITLIST_PATH=data/waitlist.jsonl
CAREEROS_CHECKOUT_INTENTS_PATH=data/checkout-intents.jsonl
CAREEROS_ALLOWED_ORIGINS=https://safal207.github.io
```

For a deployed backend, `CAREEROS_ALLOWED_ORIGINS` must include the frontend origin.

For GitHub Pages, use:

```txt
https://safal207.github.io
```

## Docker deploy path

The repository includes a backend `Dockerfile`.

Build locally:

```bash
docker build -t careeros-api .
```

Run locally with the Render-style port:

```bash
docker run --rm -p 10000:10000 \
  -e PORT=10000 \
  -e CAREEROS_ADMIN_TOKEN=change-me \
  -e CAREEROS_ALLOWED_ORIGINS=http://127.0.0.1:5173,https://safal207.github.io \
  careeros-api
```

Health check:

```bash
curl http://127.0.0.1:10000/health
```

## Render/Railway/Fly-style manual settings

Use the Dockerfile-based deploy option.

Typical service settings:

```txt
Runtime: Docker
Port: 10000
Health check path: /health
```

Set environment variables:

```txt
CAREEROS_ADMIN_TOKEN=<strong-secret-token>
CAREEROS_ALLOWED_ORIGINS=https://safal207.github.io
CAREEROS_WAITLIST_PATH=data/waitlist.jsonl
CAREEROS_CHECKOUT_INTENTS_PATH=data/checkout-intents.jsonl
```

After deployment, copy the backend public URL, for example:

```txt
https://careeros-api.example.com
```

## Connect GitHub Pages frontend to backend

Set `VITE_API_BASE_URL` during the frontend build:

```bash
VITE_API_BASE_URL=https://careeros-api.example.com GITHUB_PAGES=true npm run build:web
```

For GitHub Actions Pages deploy, add `VITE_API_BASE_URL` as a repository variable:

```txt
Settings -> Secrets and variables -> Actions -> Variables -> New repository variable
```

Name:

```txt
VITE_API_BASE_URL
```

Value:

```txt
https://careeros-api.example.com
```

Then re-run the Pages workflow.

## Data persistence warning

The current MVP stores leads and checkout intents as JSONL files:

```txt
data/waitlist.jsonl
data/checkout-intents.jsonl
```

Many free/container hosts use ephemeral filesystems. For a serious launch, move this data to persistent storage such as Postgres, SQLite on a persistent volume, S3-compatible object storage, or a managed database.

## Security checklist before public launch

- Use a strong `CAREEROS_ADMIN_TOKEN`.
- Restrict `CAREEROS_ALLOWED_ORIGINS` to known frontend domains.
- Use HTTPS only.
- Add rate limiting.
- Add proper auth/RBAC before exposing admin data broadly.
- Move JSONL data to persistent storage.
- Add email consent and privacy links.
