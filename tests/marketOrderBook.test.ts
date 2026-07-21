import { describe, expect, it } from "vitest";
import { buildCareerOrderBook } from "../src/market/orderBook.js";
import type {
  CandidateAskObservation,
  CareerOrderBookInput,
  EmployerBidObservation,
  MarketSourceRef,
} from "../src/market/models.js";

function source(recordId: string): MarketSourceRef {
  return {
    provider: "fixture",
    record_id: recordId,
    captured_at: "2026-07-21T00:00:00Z",
  };
}

function employerBid(recordId: string, salary: number | null): EmployerBidObservation {
  return {
    source: source(recordId),
    max_salary_monthly: salary,
  };
}

function candidateAsk(recordId: string, salary: number | null): CandidateAskObservation {
  return {
    source: source(recordId),
    min_salary_monthly: salary,
  };
}

function input(overrides: Partial<CareerOrderBookInput> = {}): CareerOrderBookInput {
  return {
    profession: "system_analyst",
    region: "RU_REMOTE",
    seniority: "mixed",
    currency: "RUB",
    bucket_size: 50_000,
    generated_at: "2026-07-21T12:00:00Z",
    employer_bids: [
      employerBid("vacancy-1", 180_000),
      employerBid("vacancy-2", 220_000),
      employerBid("vacancy-3", 250_000),
      employerBid("vacancy-4", 310_000),
      employerBid("vacancy-hidden", null),
    ],
    candidate_asks: [
      candidateAsk("candidate-1", 160_000),
      candidateAsk("candidate-2", 200_000),
      candidateAsk("candidate-3", 230_000),
      candidateAsk("candidate-4", 280_000),
      candidateAsk("candidate-5", 340_000),
      candidateAsk("candidate-hidden", null),
    ],
    ...overrides,
  };
}

describe("buildCareerOrderBook", () => {
  it("builds descending salary levels with cumulative market depth", () => {
    const snapshot = buildCareerOrderBook(input());

    expect(snapshot.levels.map((level) => level.salary_from)).toEqual([
      300_000,
      250_000,
      200_000,
      150_000,
    ]);

    const equilibriumLevel = snapshot.levels.find((level) => level.salary_from === 200_000);

    expect(equilibriumLevel).toEqual({
      salary_from: 200_000,
      salary_to: 249_999,
      employer_bid_depth: 1,
      candidate_ask_depth: 2,
      cumulative_employer_demand: 3,
      cumulative_candidate_supply: 3,
      executable_depth: 3,
      imbalance: 0,
      imbalance_ratio: 0,
    });
  });

  it("selects the most balanced salary band", () => {
    const snapshot = buildCareerOrderBook(input());

    expect(snapshot.equilibrium_band).toEqual({
      salary_from: 200_000,
      salary_to: 249_999,
    });
  });

  it("reports hidden salary coverage without inventing values", () => {
    const snapshot = buildCareerOrderBook(input());

    expect(snapshot.coverage).toEqual({
      employer_records: 5,
      candidate_records: 6,
      disclosed_employer_bids: 4,
      disclosed_candidate_asks: 5,
      hidden_employer_salaries: 1,
      hidden_candidate_expectations: 1,
    });
    expect(snapshot.best_employer_bid).toBe(310_000);
    expect(snapshot.best_candidate_ask).toBe(160_000);
    expect(snapshot.negotiation_gap).toBe(-150_000);
  });

  it("returns an empty evidence-safe snapshot when no salaries are disclosed", () => {
    const snapshot = buildCareerOrderBook(input({
      employer_bids: [employerBid("vacancy-hidden", null)],
      candidate_asks: [candidateAsk("candidate-hidden", null)],
    }));

    expect(snapshot.levels).toEqual([]);
    expect(snapshot.equilibrium_band).toBeNull();
    expect(snapshot.best_employer_bid).toBeNull();
    expect(snapshot.best_candidate_ask).toBeNull();
    expect(snapshot.negotiation_gap).toBeNull();
  });

  it("rejects invalid bucket sizes and salary observations", () => {
    expect(() => buildCareerOrderBook(input({ bucket_size: 0 }))).toThrow(
      "bucket_size must be a positive integer",
    );

    expect(() => buildCareerOrderBook(input({
      employer_bids: [employerBid("invalid-vacancy", -1)],
    }))).toThrow("employer bid must be a positive integer");
  });
});
