# API

CareerOS exposes a small FastAPI service for resume-vacancy match analysis.

## Run locally

Install dependencies:

```bash
python -m pip install -e .[dev]
```

Start the API:

```bash
uvicorn careeros.api:app --reload
```

Open docs:

```txt
http://127.0.0.1:8000/docs
```

## Healthcheck

```bash
curl http://127.0.0.1:8000/health
```

Response:

```json
{
  "ok": true,
  "service": "careeros"
}
```

## Create match report

Endpoint:

```txt
POST /api/matches
```

Request:

```json
{
  "resume_text": "Senior QA Engineer with 12+ years of fintech, API testing, SQL...",
  "vacancy_text": "Senior QA Engineer. Requirements: API testing, SQL, fintech..."
}
```

Response:

```json
{
  "match_score": 82,
  "risk_score": 28,
  "growth_score": 63,
  "salary_fit": "unknown",
  "recommendation": "apply",
  "strong_matches": [],
  "missing_skills": [],
  "risks": [],
  "application_strategy": "Lead with evidence-backed strengths."
}
```

The response shape follows:

```txt
schemas/match-report.schema.json
```

## Design note

The first API version uses the deterministic analyzer. Future versions can add LLM-assisted analysis behind the same `MatchReport` contract.
