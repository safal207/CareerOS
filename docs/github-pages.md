# GitHub Pages Deployment

CareerOS can publish the static Vite frontend to GitHub Pages.

## Public URL

After the Pages workflow runs on `main`, the frontend is expected at:

```txt
https://safal207.github.io/CareerOS/
```

Admin route:

```txt
https://safal207.github.io/CareerOS/admin
```

## What is deployed

Only the static frontend is deployed:

```txt
dist/web
```

GitHub Pages does not run the Node backend. These API routes require a separately deployed backend before they work from the public Pages site:

```txt
POST /api/waitlist
GET /api/waitlist
POST /api/checkout-intents
GET /api/checkout-intents
```

For local full-stack validation, use:

```bash
npm run dev
npm run dev:web
```

## Connect Pages to a remote backend

Deploy the backend first. See:

```txt
docs/backend-deploy.md
```

Then add this GitHub repository variable:

```txt
Settings -> Secrets and variables -> Actions -> Variables -> New repository variable
```

Name:

```txt
VITE_API_BASE_URL
```

Value example:

```txt
https://careeros-api.example.com
```

After this variable is set, re-run the Pages workflow. The public frontend will call the remote backend instead of relative `/api/*` paths.

## Workflow

The Pages workflow lives at:

```txt
.github/workflows/pages.yml
```

It runs on:

- push to `main`;
- manual `workflow_dispatch`.

The workflow builds with:

```bash
GITHUB_PAGES=true npm run build:web
```

It also passes this optional variable into the Vite build:

```txt
VITE_API_BASE_URL=${{ vars.VITE_API_BASE_URL }}
```

This sets the Vite base path to:

```txt
/CareerOS/
```

## GitHub repository setting

In GitHub, set Pages source to:

```txt
GitHub Actions
```

Path:

```txt
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

## Production note

For a real production funnel, deploy the backend separately and connect the static frontend to that backend. GitHub Pages alone is suitable for landing-page/demo distribution, not for protected admin APIs or JSONL persistence.
