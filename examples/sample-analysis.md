# Sample Analysis

This is an example of the expected MVP output for `sample-resume.md` matched against `sample-vacancy.md`.

## Summary

Recommendation: `strong_apply`

The candidate is a strong fit because the vacancy emphasizes fintech QA, API testing, SQL validation, manual QA depth, defect investigation, and work with high-reliability systems.

Main gaps: Kafka, Docker, and Python automation are either missing or not strongly proven.

## Scores

```json
{
  "match_score": 88,
  "risk_score": 28,
  "growth_score": 74,
  "salary_fit": "unknown",
  "recommendation": "strong_apply"
}
```

## Strong matches

```json
[
  {
    "requirement": "5+ years of QA experience",
    "evidence": "12+ years of QA experience",
    "confidence": 0.98
  },
  {
    "requirement": "API testing with Postman or Swagger",
    "evidence": "Validated REST APIs with Postman and Swagger",
    "confidence": 0.94
  },
  {
    "requirement": "SQL skills for data validation",
    "evidence": "Used SQL for backend data checks and validation of financial/reporting data",
    "confidence": 0.93
  },
  {
    "requirement": "Fintech, banking, brokerage, or reporting products",
    "evidence": "12+ years in fintech, banking, reporting systems",
    "confidence": 0.96
  }
]
```

## Missing or weakly proven skills

```json
[
  {
    "skill": "Kafka",
    "severity": "medium",
    "suggested_positioning": "Do not claim Kafka experience unless true. Mention microservice and integration testing experience instead."
  },
  {
    "skill": "Docker",
    "severity": "low",
    "suggested_positioning": "Mention Docker basics only if the candidate has used docker-compose, logs, or local environments."
  },
  {
    "skill": "Python automation",
    "severity": "medium",
    "suggested_positioning": "Frame as transition interest if automation experience is limited."
  }
]
```

## Risks

```json
[
  {
    "risk": "Salary range not specified",
    "severity": "medium",
    "question_to_ask": "Could you share the compensation range for this role?"
  },
  {
    "risk": "Practical testing task may be time-consuming",
    "severity": "low",
    "question_to_ask": "How long does the practical task usually take, and is it based on a synthetic example?"
  }
]
```

## Application draft

Здравствуйте!

Меня заинтересовала вакансия Senior QA Engineer, потому что она хорошо совпадает с моим опытом в финтехе, API testing, SQL validation и расследовании сложных дефектов в высоконадёжных системах.

У меня 12+ лет опыта в QA, включая банковские, отчётные и клиентские web-системы. Я уверенно работаю с Postman/Swagger, SQL, DevTools, логами и тестовой документацией. Особенно силён в проверке бизнес-критичных сценариев, где важны корректность данных, воспроизводимость дефектов и понятная коммуникация с разработкой и продуктом.

Буду рад обсудить, как мой опыт может быть полезен вашей команде.

## Resume adaptation suggestion

Suggested headline:

> Senior QA Engineer | FinTech, API Testing, SQL Validation, High-Reliability Systems

Suggested summary:

> Senior QA Engineer with 12+ years of experience in fintech, banking, reporting systems, REST API testing, SQL-based data validation, and complex defect investigation. Strong in manual QA, test design, regression coverage, logs/observability, and cross-functional collaboration in high-reliability product environments.
