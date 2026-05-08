export type MatchRecommendation =
  | "strong_apply"
  | "apply"
  | "apply_with_positioning"
  | "skip"
  | "needs_more_info";

export type SalaryFit =
  | "good_fit"
  | "below_expectation"
  | "above_expectation"
  | "unknown"
  | "needs_negotiation";

export type Severity = "low" | "medium" | "high";

export interface SkillEvidence {
  requirement: string;
  evidence: string;
  confidence: number;
}

export interface MissingSkill {
  skill: string;
  severity: Severity;
  suggested_positioning: string;
}

export interface RiskSignal {
  risk: string;
  severity: Severity;
  question_to_ask: string | null;
}

export interface MatchReport {
  match_score: number;
  risk_score: number;
  growth_score: number;
  salary_fit: SalaryFit;
  recommendation: MatchRecommendation;
  strong_matches: SkillEvidence[];
  missing_skills: MissingSkill[];
  risks: RiskSignal[];
  application_strategy: string;
}

export interface MatchRequest {
  resume_text: string;
  vacancy_text: string;
}
