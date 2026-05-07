# Scoring Model

CareerOS scoring must be explainable, conservative, and evidence-based.

A score is useful only if the system can explain why it was produced.

## Core scores

### Match Score

How well the candidate fits the vacancy based on resume evidence.

Range: `0-100`.

Suggested interpretation:

- `90-100` — exceptional match;
- `75-89` — strong match;
- `60-74` — plausible match with gaps;
- `40-59` — weak match;
- `0-39` — poor match.

### Risk Score

How risky the opportunity appears for the candidate.

Range: `0-100`, where higher means riskier.

Risk sources:

- vague requirements;
- unrealistic scope;
- unclear salary;
- high-pressure wording;
- too many unrelated responsibilities;
- mismatch with candidate constraints;
- seniority mismatch;
- suspicious employer signals.

### Growth Score

How much the role can improve the candidate's career trajectory.

Range: `0-100`.

Growth sources:

- stronger domain;
- better compensation potential;
- improved title;
- better stack;
- international exposure;
- leadership opportunity;
- portfolio value.

### Salary Fit

Possible values:

- `good_fit`;
- `below_expectation`;
- `above_expectation`;
- `unknown`;
- `needs_negotiation`.

## Evidence model

Every positive match should reference evidence.

Example:

```json
{
  "requirement": "API testing experience",
  "candidate_evidence": "12+ years QA, Postman, REST API validation",
  "confidence": 0.92,
  "verdict": "strong_match"
}
```

Every gap should also be explicit.

```json
{
  "requirement": "Kafka experience",
  "candidate_evidence": null,
  "confidence": 0.81,
  "verdict": "missing_or_unproven"
}
```

## Recommendation logic

Suggested first-pass rule:

```txt
if match_score >= 85 and risk_score <= 35:
  recommendation = strong_apply
elif match_score >= 70 and risk_score <= 55:
  recommendation = apply
elif match_score >= 60 and growth_score >= 75:
  recommendation = apply_with_positioning
elif match_score < 45 or risk_score >= 75:
  recommendation = skip
else:
  recommendation = needs_more_info
```

## Red flags

Initial red-flag examples:

- "stress resistance" used as a central requirement;
- responsibilities span several roles without clear seniority;
- no salary and no growth signals;
- vague phrases such as "do everything", "wear many hats" without compensation upside;
- unpaid test task that resembles real production work;
- mismatch between seniority title and required ownership;
- aggressive availability expectations.

## Anti-hallucination rules

CareerOS must not fabricate experience.

If a skill is not present in the resume, the system may write:

> I have adjacent experience with API testing and distributed systems, and I am ready to ramp up on Kafka.

It must not write:

> I have strong Kafka production experience.

## Output schema draft

```json
{
  "match_score": 82,
  "risk_score": 24,
  "growth_score": 78,
  "salary_fit": "unknown",
  "recommendation": "apply",
  "strong_matches": [
    {
      "requirement": "API testing",
      "evidence": "Postman, REST API checks, fintech backend validation",
      "confidence": 0.9
    }
  ],
  "missing_skills": [
    {
      "skill": "Kafka",
      "severity": "medium",
      "suggested_positioning": "Mention adjacent microservice/event-driven testing exposure only if true."
    }
  ],
  "risks": [
    {
      "risk": "Salary not specified",
      "severity": "medium",
      "question_to_ask": "Could you share the compensation range for this role?"
    }
  ],
  "application_strategy": "Lead with fintech QA, API testing, SQL validation, and defect investigation."
}
```

## Test cases

The scoring engine should be tested against examples where:

- the candidate is clearly qualified;
- the candidate is overqualified;
- the candidate is underqualified;
- the vacancy is vague or risky;
- the resume contains adjacent but not exact experience;
- the vacancy is high-growth but not perfect fit.
