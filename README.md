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

## MVP

The first version focuses on a narrow but valuable workflow:

1. Paste or import a resume.
2. Paste or import a vacancy.
3. Analyze fit, risks, gaps, and opportunity quality.
4. Generate a tailored application message.
5. Suggest resume edits for the target role.
6. Track the opportunity through a simple pipeline.
7. Prepare for interview questions and salary negotiation.

## Quick start

Install locally:

```bash
python -m pip install -e .[dev]
```

Run the deterministic MVP analyzer:

```bash
careeros \
  --resume examples/sample-resume.md \
  --vacancy examples/sample-vacancy.md \
  --pretty
```

Run the API:

```bash
uvicorn careeros.api:app --reload
```

Then open:

```txt
http://127.0.0.1:8000/docs
```

Run tests:

```bash
python -m pytest
```

## Output contract

The analyzer returns a structured `MatchReport` object. Its public JSON shape is documented in:

```txt
schemas/match-report.schema.json
```

This schema is the contract for future API endpoints, UI views, and LLM-assisted analysis.

## Modules

- **Resume Parser** — extracts experience, roles, skills, domains, achievements, and constraints.
- **Vacancy Analyzer** — extracts requirements, salary signals, employer expectations, and red flags.
- **Match Scoring Engine** — compares resume evidence against vacancy requirements.
- **Application Generator** — creates concise, role-specific application messages.
- **Pipeline Tracker** — tracks job opportunities from saved to offer/rejected.
- **Interview Prep** — generates likely questions, answer angles, and evidence-backed stories.
- **Integration Layer** — future-safe connectors for job boards such as HeadHunter, email, and calendars.

## Repository map

```txt
CareerOS/
├─ careeros/
│  ├─ analyzer.py
│  ├─ api.py
│  ├─ cli.py
│  └─ models.py
├─ docs/
│  ├─ product-vision.md
│  ├─ mvp-scope.md
│  ├─ architecture.md
│  ├─ scoring-model.md
│  ├─ hh-integration.md
│  ├─ api.md
│  ├─ cli.md
│  └─ privacy-and-safety.md
├─ examples/
│  ├─ sample-resume.md
│  ├─ sample-vacancy.md
│  └─ sample-analysis.md
├─ schemas/
│  └─ match-report.schema.json
├─ tests/
│  ├─ test_analyzer.py
│  ├─ test_api.py
│  └─ test_match_report_contract.py
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

Early product foundation. Current goal: build the first usable MVP around resume + vacancy analysis before adding external integrations.

## License

MIT
