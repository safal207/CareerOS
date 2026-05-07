# HeadHunter Integration

CareerOS should integrate with HeadHunter safely and incrementally.

## Official integration model

HeadHunter provides an official API for integrating hh.ru functionality into external products.

The public documentation describes areas such as vacancy search, vacancy details, resumes, applicant authorization, employers, dictionaries, webhooks, and OAuth-based access.

## Safety boundary

CareerOS must not ask users for their hh.ru login and password.

The preferred model is:

1. anonymous public vacancy search where possible;
2. user-pasted vacancy text for v0.1;
3. public vacancy URL parsing/import where allowed;
4. official OAuth for account-specific actions;
5. explicit user approval before every external action.

## MVP approach

Do not start with full account automation.

Start with:

- paste vacancy text;
- analyze vacancy;
- generate application message;
- let user manually apply in hh.ru.

This avoids credential risk, platform abuse risk, and premature dependency on external API permissions.

## Later integration stages

### Stage 1: Public vacancy import

Input:

- vacancy URL;
- vacancy ID;
- search query.

Output:

- normalized vacancy object;
- match report;
- application draft.

### Stage 2: OAuth user connection

Use OAuth to request user permission without storing user passwords.

Potential capabilities depend on current API permissions and terms:

- read user context;
- access resumes where permitted;
- access favorited vacancies where permitted;
- support response workflows where permitted.

### Stage 3: User-confirmed apply flow

CareerOS may prepare an application, but the user must review and explicitly confirm.

Avoid silent background applications in early versions.

## Integration risks

- API access rules may change;
- some methods may require applicant authorization;
- some methods may be employer-only;
- response/message APIs may have limitations;
- rate limits and terms of use must be respected;
- job-board UX can change independently of CareerOS.

## Open questions

- Which applicant-side endpoints are available for response creation?
- What limits apply to candidate OAuth usage?
- What fields are returned for vacancy search without authorization?
- Can a user select one of their resumes through API?
- Which response workflows are allowed by current hh.ru rules?

## Product rule

CareerOS should remain useful even without direct hh.ru account integration.

The core value is analysis and decision support. Integration is acceleration, not the product foundation.
