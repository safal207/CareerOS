# CareerOS

CareerOS is an AI-powered job search operating system for serious job seekers.

It helps candidates move from chaotic job hunting to an evidence-based pipeline:

- score vacancies against real experience;
- adapt resumes for specific roles;
- generate personalized applications;
- track the job-search pipeline;
- prepare for interviews;
- negotiate offers with evidence.

## Core idea

Most job boards show vacancies.

CareerOS explains which opportunities are worth pursuing, why they fit, what risks they carry, and how the candidate should respond.

The product is designed as a decision-support layer, not an unsafe auto-clicking bot. The user stays in control of final actions such as applying, sending messages, or changing external accounts.

## TypeScript-first MVP

CareerOS is developed as a TypeScript-only MVP so the analyzer, API, and UI can share one contract.

The first product surface is a ClickFunnels + Product Launch Formula + SamCart-inspired funnel:

1. Strong promise.
2. Free lead magnet: Instant Job Fit Audit.
3. Value stack.
4. Analyzer value moment.
5. Next paid offer path.
6. Waitlist capture.
7. Token-protected admin dashboard.

## Quick start

Install dependencies:

```bash
npm install
```

Run the deterministic analyzer from CLI:

```bash
npm run analyze -- \
  --resume examples/sample-resume.md \
  --vacancy examples/sample-vacancy.md \
  --pretty
```

Run the API:

```bash
npm run dev
```

Run the funnel frontend:

```bash
npm run dev:web
```

Open the funnel:

```txt
http://127.0.0.1:5173
```

Open the admin dashboard:

```txt
http://127.0.0.1:5173/admin
```

For the full local MVP flow, see [`docs/local-mvp-runbook.md`](docs/local-mvp-runbook.md).

For GitHub Pages static frontend deployment, see [`docs/github-pages.md`](docs/github-pages.md).

For backend deployment and remote API wiring, see [`docs/backend-deploy.md`](docs/backend-deploy.md). The repo also includes `render.yaml` for Render Blueprint deployment.

Build and test:

```bash
npm run build
npm test
```

## Modules

- **Resume Parser** — extracts experience, roles, skills, domains, achievements, and constraints.
- **Vacancy Analyzer** — extracts requirements, salary signals, employer expectations, and red flags.
- **Match Scoring Engine** — compares resume evidence against vacancy requirements.
- **Funnel Frontend** — turns analysis into a conversion-oriented value moment.
- **Waitlist Capture** — stores early-access demand in JSONL for MVP validation.
- **Admin Dashboard** — shows captured leads and funnel interest signals.
- **Application Generator** — creates concise, role-specific application messages.
- **Pipeline Tracker** — tracks job opportunities from saved to offer/rejected.
- **Interview Prep** — generates likely questions, answer angles, and evidence-backed stories.
- **Integration Layer** — future-safe connectors for job boards such as HeadHunter, email, and calendars.

## Repository map

```txt
CareerOS/
├─ src/
│  ├─ adminAuth.ts
│  ├─ analyzer.ts
│  ├─ cli.ts
│  ├─ models.ts
│  ├─ server.ts
│  ├─ waitlist.ts
│  └─ web/
│     ├─ AdminDashboard.tsx
│     ├─ App.tsx
│     ├─ main.tsx
│     ├─ styles.css
│     ├─ waitlistAdminClient.ts
│     └─ waitlistClient.ts
├─ docs/
│  ├─ admin-dashboard.md
│  ├─ backend-deploy.md
│  ├─ github-pages.md
│  ├─ local-mvp-runbook.md
│  ├─ product-vision.md
│  ├─ mvp-scope.md
│  ├─ architecture.md
│  ├─ scoring-model.md
│  ├─ funnel-strategy.md
│  ├─ hh-integration.md
│  ├─ typescript.md
│  ├─ waitlist-api.md
│  └─ privacy-and-safety.md
├─ examples/
│  ├─ sample-resume.md
│  ├─ sample-vacancy.md
│  └─ sample-analysis.md
├─ schemas/
│  └─ match-report.schema.json
├─ tests/
│  ├─ analyzer.test.ts
│  ├─ server.test.ts
│  ├─ waitlist.test.ts
│  ├─ waitlistAdminClient.test.ts
│  └─ waitlistClient.test.ts
├─ render.yaml
└─ .github/
   ├─ workflows/
   │  ├─ ci.yml
   │  └─ pages.yml
   └─ ISSUE_TEMPLATE/
      ├─ feature_request.md
      └─ mvp_task.md
```

## MVP output example

```json
{
  "match_score": 82,
  "salary_fit": "unknown",
  "risk_score": 24,
  "growth_score": 78,
  "recommendation": "apply",
  "strong_matches": ["API testing", "SQL", "FinTech", "Postman"],
  "missing_skills": ["Kafka", "Docker"],
  "application_strategy": "Emphasize fintech QA, API validation, SQL checks, and defect investigation. Do not overclaim Kafka experience."
}
```

## Product principles

1. **Evidence first** — recommendations must point to resume/vacancy evidence.
2. **Human in control** — CareerOS suggests; the candidate decides.
3. **No credential harvesting** — never ask users to share job-board passwords.
4. **No spam automation** — avoid mass low-quality applications.
5. **Explain every score** — a score without reasons is just decoration.
6. **Privacy by design** — resumes and career data are sensitive by default.

## Status

Early TypeScript-first MVP with a funnel-style frontend, waitlist capture, and admin dashboard. Current goal: validate demand and conversion before adding payment, CRM, email automation, and external integrations.

## License

MIT
