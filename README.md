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
- **Application Generator** — creates concise, role-specific application messages.
- **Pipeline Tracker** — tracks job opportunities from saved to offer/rejected.
- **Interview Prep** — generates likely questions, answer angles, and evidence-backed stories.
- **Integration Layer** — future-safe connectors for job boards such as HeadHunter, email, and calendars.

## Repository map

```txt
CareerOS/
├─ src/
│  ├─ analyzer.ts
│  ├─ cli.ts
│  ├─ models.ts
│  ├─ server.ts
│  └─ web/
│     ├─ main.tsx
│     └─ styles.css
├─ docs/
│  ├─ product-vision.md
│  ├─ mvp-scope.md
│  ├─ architecture.md
│  ├─ scoring-model.md
│  ├─ funnel-strategy.md
│  ├─ hh-integration.md
│  ├─ typescript.md
│  └─ privacy-and-safety.md
├─ examples/
│  ├─ sample-resume.md
│  ├─ sample-vacancy.md
│  └─ sample-analysis.md
├─ schemas/
│  └─ match-report.schema.json
├─ tests/
│  ├─ analyzer.test.ts
│  └─ server.test.ts
└─ .github/
   ├─ workflows/
   │  └─ ci.yml
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

Early TypeScript-first MVP with a funnel-style frontend. Current goal: turn resume + vacancy analysis into a high-converting value moment before adding external integrations.

## License

MIT
