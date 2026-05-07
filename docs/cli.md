# CLI

CareerOS includes a small command-line interface for the MVP analyzer.

## Install locally

```bash
python -m pip install -e .
```

## Run analysis

```bash
careeros \
  --resume examples/sample-resume.md \
  --vacancy examples/sample-vacancy.md \
  --pretty
```

## Expected output shape

```json
{
  "match_score": 88,
  "risk_score": 14,
  "growth_score": 63,
  "salary_fit": "unknown",
  "recommendation": "strong_apply",
  "strong_matches": [],
  "missing_skills": [],
  "risks": [],
  "application_strategy": "Lead with evidence-backed strengths."
}
```

Exact scores can change as the scoring model evolves.

## Design note

The CLI currently uses a deterministic rule-based analyzer. This gives CareerOS a baseline that can be tested before LLM-based analysis is added.
