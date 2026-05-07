# Privacy and Safety

CareerOS handles sensitive career data. Privacy and safety are product requirements, not optional polish.

## Sensitive data categories

CareerOS may process:

- resumes;
- work history;
- salary expectations;
- location preferences;
- immigration or relocation constraints;
- email drafts;
- job-search status;
- interview notes;
- employer names;
- rejection/offer history.

Treat all of this as sensitive by default.

## Safety principles

### 1. No password collection

CareerOS must never ask users to share raw passwords for job boards, email accounts, or other external services.

If integration is needed, use official OAuth or user-controlled import/export.

### 2. Human approval for external actions

CareerOS may draft application messages, but the user must approve sending or applying.

Do not build silent mass-apply behavior.

### 3. No fabricated experience

CareerOS must not invent skills, achievements, employers, titles, dates, salaries, or certifications.

Generated text should remain faithful to candidate evidence.

### 4. Clear uncertainty

If the system is unsure, it should say so.

Examples:

- salary not specified;
- employer quality unknown;
- candidate skill not proven in resume;
- job seniority ambiguous.

### 5. Data minimization

Only store what is needed for the product workflow.

Avoid storing raw documents indefinitely unless the user explicitly wants that.

### 6. Explainable recommendations

Every recommendation should include reasons and evidence.

Bad:

> Apply. Score: 82.

Better:

> Apply because the vacancy asks for API testing, SQL, and fintech domain experience, all of which appear in the resume. Main gap: Kafka is not clearly proven.

## Risky features to avoid early

Avoid in v0.1:

- browser automation against job boards;
- auto-clicking apply buttons;
- storing third-party credentials;
- scraping private account pages;
- mass-generated applications;
- aggressive recruiter spam;
- fake resume enhancement.

## Safe integration model

Preferred integration order:

1. User-pasted vacancy/resume text.
2. Public vacancy URL import if allowed.
3. Official APIs where available.
4. OAuth-based user authorization.
5. User-confirmed external actions.

## Audit trail

For each generated recommendation, store:

- input snapshot reference;
- generated output;
- model/provider metadata when applicable;
- scoring reasons;
- user decision;
- timestamp.

This creates a useful feedback loop without hiding how decisions were made.

## User trust copy

CareerOS should communicate clearly:

> We help you decide and write better. We do not apply without your approval, ask for your job-board password, or invent experience.
