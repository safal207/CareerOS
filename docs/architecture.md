# Architecture

CareerOS should start simple and modular.

The first implementation can be a monolith with clear internal boundaries. The goal is to validate product value before introducing heavy infrastructure.

## Suggested initial stack

- Frontend: Next.js or React
- Backend: FastAPI
- Database: PostgreSQL
- AI layer: provider-agnostic LLM interface
- Background jobs: not required for v0.1
- Auth: magic link or local-only during prototype

Rust can be introduced later for deterministic scoring, high-performance parsing, or traceable evaluation modules.

## High-level components

```txt
User Interface
  -> Application API
    -> Resume Parser
    -> Vacancy Analyzer
    -> Match Scoring Engine
    -> Application Generator
    -> Resume Adapter
    -> Interview Prep Engine
    -> Pipeline Store
    -> Integration Layer
```

## Data flow

```txt
Resume text + Vacancy text
  -> normalize inputs
  -> extract structured facts
  -> compare evidence to requirements
  -> compute transparent scores
  -> generate application plan
  -> save opportunity snapshot
```

## Core entities

### CandidateProfile

Represents the candidate's professional evidence.

Fields:

- id;
- headline;
- years_of_experience;
- roles;
- domains;
- skills;
- tools;
- achievements;
- languages;
- constraints;
- raw_resume_ref.

### Vacancy

Represents one job opportunity.

Fields:

- id;
- source;
- source_url;
- title;
- company;
- location;
- remote_mode;
- requirements;
- responsibilities;
- nice_to_have;
- salary;
- red_flags;
- raw_text_ref.

### MatchReport

Represents the comparison between candidate and vacancy.

Fields:

- id;
- candidate_profile_id;
- vacancy_id;
- match_score;
- risk_score;
- growth_score;
- salary_fit;
- recommendation;
- strong_matches;
- missing_skills;
- evidence;
- warnings;
- generated_at.

### ApplicationDraft

Represents generated outreach text.

Fields:

- id;
- match_report_id;
- variant;
- language;
- body;
- created_at.

### PipelineItem

Represents job-search state.

Fields:

- id;
- vacancy_id;
- status;
- next_action;
- notes;
- updated_at.

## API sketch

```txt
POST /api/resumes/parse
POST /api/vacancies/analyze
POST /api/matches
POST /api/applications/generate
GET  /api/pipeline
PATCH /api/pipeline/:id
```

## Design principles

### Keep LLM outputs structured

Every LLM call should return typed JSON or be validated into typed objects.

### Separate scoring from generation

Scoring should be explainable and testable. Text generation should consume the score report, not invent its own logic.

### Store raw inputs separately

Raw resume and vacancy text should be stored with clear privacy controls. Derived reports should reference raw inputs without mutating them.

### Avoid hidden automation

Any external action such as applying, messaging, or changing profile data should require explicit user control.

## Future architecture

Potential future modules:

- job-board connectors;
- email reply classifier;
- calendar interview sync;
- offer comparison engine;
- market salary intelligence;
- deterministic evaluation suite;
- audit trail for generated recommendations.
