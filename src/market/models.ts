export type MarketSeniority = "junior" | "middle" | "senior" | "lead" | "mixed";

export type MarketCurrency = "RUB" | "USD" | "EUR" | "TRY";

export interface MarketSourceRef {
  provider: string;
  record_id: string;
  captured_at: string;
}

export interface EmployerBidObservation {
  source: MarketSourceRef;
  max_salary_monthly: number | null;
}

export interface CandidateAskObservation {
  source: MarketSourceRef;
  min_salary_monthly: number | null;
}

export interface CareerOrderBookInput {
  profession: string;
  region: string;
  seniority: MarketSeniority;
  currency: MarketCurrency;
  bucket_size: number;
  generated_at: string;
  employer_bids: EmployerBidObservation[];
  candidate_asks: CandidateAskObservation[];
}

export interface CareerOrderBookLevel {
  salary_from: number;
  salary_to: number;
  employer_bid_depth: number;
  candidate_ask_depth: number;
  cumulative_employer_demand: number;
  cumulative_candidate_supply: number;
  executable_depth: number;
  imbalance: number;
  imbalance_ratio: number;
}

export interface SalaryBand {
  salary_from: number;
  salary_to: number;
}

export interface CareerOrderBookCoverage {
  employer_records: number;
  candidate_records: number;
  disclosed_employer_bids: number;
  disclosed_candidate_asks: number;
  hidden_employer_salaries: number;
  hidden_candidate_expectations: number;
}

export interface CareerOrderBookSnapshot {
  profession: string;
  region: string;
  seniority: MarketSeniority;
  currency: MarketCurrency;
  bucket_size: number;
  generated_at: string;
  best_employer_bid: number | null;
  best_candidate_ask: number | null;
  negotiation_gap: number | null;
  equilibrium_band: SalaryBand | null;
  coverage: CareerOrderBookCoverage;
  levels: CareerOrderBookLevel[];
}
