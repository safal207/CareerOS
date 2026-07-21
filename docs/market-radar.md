# CareerOS Market Radar

CareerOS Market Radar extends vacancy-to-candidate analysis into evidence-based labor-market intelligence.

The first bounded capability is the **Career Order Book**: a deterministic representation of employer salary budgets and candidate salary expectations across comparable salary bands.

## Market interpretation

CareerOS maps labor-market observations into an order-book model:

- an **employer bid** is the maximum disclosed monthly salary an employer is prepared to pay;
- a **candidate ask** is the minimum disclosed monthly salary a candidate expects;
- a **salary level** groups observations into a fixed salary band;
- **cumulative employer demand** counts employers whose maximum budget reaches the level;
- **cumulative candidate supply** counts candidates whose minimum expectation is at or below the level;
- **executable depth** is the smaller cumulative side at that level;
- **imbalance** is cumulative employer demand minus cumulative candidate supply.

A positive imbalance means employer demand is deeper at the level. A negative imbalance means candidate supply is deeper.

The equilibrium band is the salary band with the smallest absolute imbalance. Ties prefer greater executable depth and then the lower salary band. This is a deterministic market indicator, not a claim that a real-world hire will occur at that price.

## Evidence boundary

The first implementation does not scrape job boards and does not infer hidden salaries.

Each observation must carry:

- provider;
- provider record identifier;
- capture timestamp;
- disclosed salary value or `null`.

Hidden employer salaries and hidden candidate expectations are counted in coverage metrics but excluded from salary depth. CareerOS must not silently replace them with estimated values.

Later estimation can be added as a separate, explicitly labelled layer with its own confidence and methodology.

## Initial vertical slice

The first product slice is:

```text
Profession: system_analyst
Region: RU_REMOTE
Seniority: middle / senior / mixed
Currency: RUB
Salary range of interest: 150,000–450,000 per month
Time windows: 7 / 30 / 90 days
```

The core engine is generic and can represent other professions and regions once normalized observations are available.

## TypeScript API

```ts
import { buildCareerOrderBook } from "../src/market/orderBook.js";

const snapshot = buildCareerOrderBook({
  profession: "system_analyst",
  region: "RU_REMOTE",
  seniority: "mixed",
  currency: "RUB",
  bucket_size: 50_000,
  generated_at: "2026-07-21T12:00:00Z",
  employer_bids: [
    {
      source: {
        provider: "hh",
        record_id: "vacancy-1",
        captured_at: "2026-07-21T10:00:00Z",
      },
      max_salary_monthly: 250_000,
    },
  ],
  candidate_asks: [
    {
      source: {
        provider: "candidate_panel",
        record_id: "candidate-1",
        captured_at: "2026-07-21T10:00:00Z",
      },
      min_salary_monthly: 220_000,
    },
  ],
});
```

## What this foundation provides

- shared TypeScript contracts for market observations and snapshots;
- deterministic salary-band aggregation;
- level and cumulative depth;
- executable depth and market imbalance;
- a reproducible equilibrium-band selection rule;
- coverage reporting for hidden salary data;
- no dependency on an external job-board API.

## Next implementation stages

1. Add a normalized vacancy record and salary-range parser.
2. Add an import adapter for public HeadHunter vacancy data within current API terms.
3. Store append-only market observations and daily snapshots.
4. Expose a read-only Market Radar API endpoint.
5. Add the graphical Career Order Book to the React frontend.
6. Add 7/30/90-day demand, salary, and skill momentum.
7. Add candidate-supply data only from a lawful, clearly documented source.

## Product boundary

CareerOS Market Radar is decision support. It must always distinguish:

- observed data;
- normalized data;
- estimated data;
- derived indicators.

A visually precise chart must never imply more precision than the evidence supports.
