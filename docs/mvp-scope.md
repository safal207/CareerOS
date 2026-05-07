# MVP Scope

The MVP must prove one concrete value proposition:

> Given a resume and a vacancy, CareerOS produces a clear, evidence-backed application plan.

## In scope

### 1. Resume input

User can paste resume text or upload a plain-text/Markdown version later.

Extracted fields:

- current title;
- years of experience;
- domains;
- technical skills;
- tools;
- achievements;
- constraints;
- preferred roles;
- compensation expectations when available.

### 2. Vacancy input

User can paste a vacancy text or URL-derived text later.

Extracted fields:

- role title;
- company;
- location/remote mode;
- must-have requirements;
- nice-to-have requirements;
- tools and stack;
- salary signals;
- responsibilities;
- red flags;
- interview hints.

### 3. Match analysis

Output:

- match score;
- strong matches;
- missing skills;
- uncertain areas;
- risk score;
- growth score;
- application recommendation.

Recommendation values:

- `strong_apply`;
- `apply`;
- `apply_with_positioning`;
- `skip`;
- `needs_more_info`.

### 4. Application generation

Generate:

- short application message;
- slightly warmer version;
- concise recruiter version;
- optional English version.

### 5. Resume adaptation

Generate suggested resume edits:

- summary block;
- skills ordering;
- experience bullet rewrites;
- missing proof points to add;
- warnings against overclaiming.

### 6. Pipeline tracking

Initial statuses:

- `saved`;
- `analyzed`;
- `ready_to_apply`;
- `applied`;
- `reply_received`;
- `interview`;
- `offer`;
- `rejected`;
- `archived`.

## Out of scope for v0.1

- automatic job-board account control;
- mass applying;
- storing job-board passwords;
- browser automation;
- paid subscriptions;
- multi-user teams;
- full CRM;
- mobile app;
- deep ATS integrations.

## Success criteria

The MVP is successful if a user can complete this loop in less than 10 minutes:

1. Paste resume.
2. Paste vacancy.
3. Understand fit.
4. Get a useful application message.
5. Know what to change in the resume.
6. Decide whether to apply.

## First build order

1. Define data schemas.
2. Build local CLI or API endpoint for resume/vacancy analysis.
3. Add scoring model with transparent reasons.
4. Add example inputs/outputs.
5. Add simple web UI.
6. Add persistence.
7. Add integrations later.
