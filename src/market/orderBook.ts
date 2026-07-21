import type {
  CandidateAskObservation,
  CareerOrderBookInput,
  CareerOrderBookLevel,
  CareerOrderBookSnapshot,
  EmployerBidObservation,
  SalaryBand,
} from "./models.js";

export function buildCareerOrderBook(input: CareerOrderBookInput): CareerOrderBookSnapshot {
  validateInput(input);

  const employerBids = disclosedEmployerBids(input.employer_bids);
  const candidateAsks = disclosedCandidateAsks(input.candidate_asks);
  const allSalaries = [...employerBids, ...candidateAsks];

  const levels = allSalaries.length === 0
    ? []
    : buildLevels(employerBids, candidateAsks, input.bucket_size);

  const bestEmployerBid = employerBids.length === 0 ? null : Math.max(...employerBids);
  const bestCandidateAsk = candidateAsks.length === 0 ? null : Math.min(...candidateAsks);

  return {
    profession: input.profession,
    region: input.region,
    seniority: input.seniority,
    currency: input.currency,
    bucket_size: input.bucket_size,
    generated_at: input.generated_at,
    best_employer_bid: bestEmployerBid,
    best_candidate_ask: bestCandidateAsk,
    negotiation_gap: bestEmployerBid === null || bestCandidateAsk === null
      ? null
      : bestCandidateAsk - bestEmployerBid,
    equilibrium_band: selectEquilibriumBand(levels),
    coverage: {
      employer_records: input.employer_bids.length,
      candidate_records: input.candidate_asks.length,
      disclosed_employer_bids: employerBids.length,
      disclosed_candidate_asks: candidateAsks.length,
      hidden_employer_salaries: input.employer_bids.length - employerBids.length,
      hidden_candidate_expectations: input.candidate_asks.length - candidateAsks.length,
    },
    levels,
  };
}

function buildLevels(
  employerBids: number[],
  candidateAsks: number[],
  bucketSize: number,
): CareerOrderBookLevel[] {
  const allSalaries = [...employerBids, ...candidateAsks];
  const minimumBucket = bucketStart(Math.min(...allSalaries), bucketSize);
  const maximumBucket = bucketStart(Math.max(...allSalaries), bucketSize);
  const levels: CareerOrderBookLevel[] = [];

  for (let salaryFrom = minimumBucket; salaryFrom <= maximumBucket; salaryFrom += bucketSize) {
    const salaryTo = salaryFrom + bucketSize - 1;
    const employerBidDepth = employerBids.filter((salary) => inBand(salary, salaryFrom, salaryTo)).length;
    const candidateAskDepth = candidateAsks.filter((salary) => inBand(salary, salaryFrom, salaryTo)).length;
    const cumulativeEmployerDemand = employerBids.filter((salary) => salary >= salaryFrom).length;
    const cumulativeCandidateSupply = candidateAsks.filter((salary) => salary <= salaryTo).length;
    const totalCumulativeDepth = cumulativeEmployerDemand + cumulativeCandidateSupply;
    const imbalance = cumulativeEmployerDemand - cumulativeCandidateSupply;

    levels.push({
      salary_from: salaryFrom,
      salary_to: salaryTo,
      employer_bid_depth: employerBidDepth,
      candidate_ask_depth: candidateAskDepth,
      cumulative_employer_demand: cumulativeEmployerDemand,
      cumulative_candidate_supply: cumulativeCandidateSupply,
      executable_depth: Math.min(cumulativeEmployerDemand, cumulativeCandidateSupply),
      imbalance,
      imbalance_ratio: totalCumulativeDepth === 0 ? 0 : round(imbalance / totalCumulativeDepth, 4),
    });
  }

  return levels.reverse();
}

function selectEquilibriumBand(levels: CareerOrderBookLevel[]): SalaryBand | null {
  const candidates = levels
    .filter((level) => level.cumulative_employer_demand > 0 && level.cumulative_candidate_supply > 0)
    .sort((left, right) => {
      const imbalanceDifference = Math.abs(left.imbalance) - Math.abs(right.imbalance);
      if (imbalanceDifference !== 0) return imbalanceDifference;

      const executableDifference = right.executable_depth - left.executable_depth;
      if (executableDifference !== 0) return executableDifference;

      return left.salary_from - right.salary_from;
    });

  const equilibrium = candidates[0];
  if (equilibrium === undefined) return null;

  return {
    salary_from: equilibrium.salary_from,
    salary_to: equilibrium.salary_to,
  };
}

function disclosedEmployerBids(observations: EmployerBidObservation[]): number[] {
  return observations.flatMap((observation) => observation.max_salary_monthly === null
    ? []
    : [validateSalary(observation.max_salary_monthly, "employer bid")]);
}

function disclosedCandidateAsks(observations: CandidateAskObservation[]): number[] {
  return observations.flatMap((observation) => observation.min_salary_monthly === null
    ? []
    : [validateSalary(observation.min_salary_monthly, "candidate ask")]);
}

function validateInput(input: CareerOrderBookInput): void {
  if (input.profession.trim().length === 0) throw new Error("profession must not be empty");
  if (input.region.trim().length === 0) throw new Error("region must not be empty");
  if (!Number.isInteger(input.bucket_size) || input.bucket_size <= 0) {
    throw new Error("bucket_size must be a positive integer");
  }
}

function validateSalary(value: number, label: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }

  return value;
}

function bucketStart(value: number, bucketSize: number): number {
  return Math.floor(value / bucketSize) * bucketSize;
}

function inBand(value: number, salaryFrom: number, salaryTo: number): boolean {
  return value >= salaryFrom && value <= salaryTo;
}

function round(value: number, digits: number): number {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}
