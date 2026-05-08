import type { MatchRecommendation, MatchReport, MissingSkill, RiskSignal, SalaryFit, SkillEvidence } from "./models.js";

type SkillAliasMap = Record<string, readonly string[]>;

const SKILL_ALIASES: SkillAliasMap = {
  "API testing": ["api", "rest", "postman", "swagger", "openapi"],
  SQL: ["sql", "join", "select", "database", "postgres", "mysql"],
  FinTech: ["fintech", "bank", "banking", "brokerage", "investment", "reporting", "financial"],
  "Manual QA": ["manual qa", "manual testing", "test cases", "test design", "regression", "smoke"],
  "Logs and observability": ["logs", "kibana", "elastic", "sentry", "observability", "devtools"],
  Microservices: ["microservice", "microservices", "client-server", "distributed"],
  Docker: ["docker", "docker-compose", "container"],
  Kafka: ["kafka", "event-driven", "queue", "streaming"],
  Python: ["python", "pytest", "automation"],
  "CI/CD": ["ci/cd", "gitlab ci", "github actions", "pipeline"],
} as const;

const RISK_PATTERNS: ReadonlyArray<{
  label: string;
  pattern: RegExp;
  question: string;
}> = [
  {
    label: "salary not specified",
    pattern: /salary\s+(range\s+)?not\s+specified|salary\s+is\s+not\s+specified|no\s+salary|competitive\s+salary/i,
    question: "Could you share the compensation range for this role?",
  },
  {
    label: "high stress wording",
    pattern: /stress\s+resistance|high\s+pressure|fast-paced\s+environment|multitasking/i,
    question: "How is workload planned and prioritized during peak periods?",
  },
  {
    label: "broad ownership without clear boundaries",
    pattern: /wear\s+many\s+hats|do\s+everything|end-to-end\s+ownership|all\s+qa\s+processes/i,
    question: "What are the exact responsibilities and team boundaries for this role?",
  },
  {
    label: "potentially large test task",
    pattern: /test\s+task|practical\s+task|home\s+assignment/i,
    question: "How long does the practical task usually take, and is it based on a synthetic example?",
  },
] as const;

const GROWTH_PATTERNS = [
  "lead",
  "senior",
  "international",
  "remote",
  "ownership",
  "architecture",
  "automation",
  "ai",
  "llm",
  "platform",
] as const;

export function analyzeMatch(resumeText: string, vacancyText: string): MatchReport {
  const resume = normalize(resumeText);
  const vacancy = normalize(vacancyText);

  const strongMatches = detectStrongMatches(resume, vacancy);
  const missingSkills = detectMissingSkills(resume, vacancy);
  const risks = detectRisks(vacancy);

  const matchScore = scoreMatch(strongMatches, missingSkills);
  const riskScore = scoreRisk(risks);
  const growthScore = scoreGrowth(vacancy);
  const salaryFit = detectSalaryFit(vacancy);
  const recommendation = recommend(matchScore, riskScore, growthScore);

  return {
    match_score: matchScore,
    risk_score: riskScore,
    growth_score: growthScore,
    salary_fit: salaryFit,
    recommendation,
    strong_matches: strongMatches,
    missing_skills: missingSkills,
    risks,
    application_strategy: buildStrategy(strongMatches, missingSkills, risks),
  };
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function containsAny(text: string, aliases: readonly string[]): boolean {
  return aliases.some((alias) => text.includes(alias));
}

function detectStrongMatches(resume: string, vacancy: string): SkillEvidence[] {
  const matches: SkillEvidence[] = [];

  for (const [skill, aliases] of Object.entries(SKILL_ALIASES)) {
    if (containsAny(vacancy, aliases) && containsAny(resume, aliases)) {
      matches.push({
        requirement: skill,
        evidence: `Resume contains evidence for ${skill}.`,
        confidence: 0.85,
      });
    }
  }

  const resumeYears = extractMaxYears(resume);
  const vacancyYears = extractMaxYears(vacancy);

  if (resumeYears !== null && vacancyYears !== null && resumeYears >= vacancyYears) {
    matches.push({
      requirement: `${vacancyYears}+ years of experience`,
      evidence: `Resume indicates ${resumeYears}+ years of experience.`,
      confidence: 0.95,
    });
  }

  return matches;
}

function detectMissingSkills(resume: string, vacancy: string): MissingSkill[] {
  const missing: MissingSkill[] = [];

  for (const [skill, aliases] of Object.entries(SKILL_ALIASES)) {
    if (containsAny(vacancy, aliases) && !containsAny(resume, aliases)) {
      missing.push({
        skill,
        severity: ["Kafka", "Docker", "Python"].includes(skill) ? "medium" : "high",
        suggested_positioning: positioningForMissingSkill(skill),
      });
    }
  }

  return missing;
}

function positioningForMissingSkill(skill: string): string {
  if (skill === "Kafka") {
    return "Do not claim Kafka experience unless true. Mention adjacent microservice or integration testing experience if supported.";
  }
  if (skill === "Docker") {
    return "Mention Docker basics only if there is real hands-on experience with containers or local environments.";
  }
  if (skill === "Python") {
    return "Frame Python as automation transition interest unless production automation experience is proven.";
  }
  return `Add honest evidence for ${skill} or avoid overclaiming it.`;
}

function detectRisks(vacancy: string): RiskSignal[] {
  const risks: RiskSignal[] = [];

  for (const risk of RISK_PATTERNS) {
    if (risk.pattern.test(vacancy)) {
      risks.push({ risk: risk.label, severity: "medium", question_to_ask: risk.question });
    }
  }

  if (!vacancy.includes("salary") && !vacancy.includes("compensation")) {
    risks.push({
      risk: "salary range absent",
      severity: "medium",
      question_to_ask: "Could you share the compensation range for this role?",
    });
  }

  return risks;
}

function scoreMatch(strongMatches: SkillEvidence[], missingSkills: MissingSkill[]): number {
  return clamp(45 + strongMatches.length * 8 - missingSkills.length * 5, 0, 100);
}

function scoreRisk(risks: RiskSignal[]): number {
  return clamp(risks.length * 14, 0, 100);
}

function scoreGrowth(vacancy: string): number {
  const score = 45 + GROWTH_PATTERNS.filter((token) => vacancy.includes(token)).length * 6;
  return clamp(score, 0, 100);
}

function detectSalaryFit(vacancy: string): SalaryFit {
  if (!vacancy.includes("salary") && !vacancy.includes("compensation")) {
    return "unknown";
  }
  if (vacancy.includes("not specified") || vacancy.includes("competitive")) {
    return "unknown";
  }
  return "needs_negotiation";
}

function recommend(matchScore: number, riskScore: number, growthScore: number): MatchRecommendation {
  if (matchScore >= 85 && riskScore <= 35) return "strong_apply";
  if (matchScore >= 70 && riskScore <= 55) return "apply";
  if (matchScore >= 60 && growthScore >= 75) return "apply_with_positioning";
  if (matchScore < 45 || riskScore >= 75) return "skip";
  return "needs_more_info";
}

function buildStrategy(strongMatches: SkillEvidence[], missingSkills: MissingSkill[], risks: RiskSignal[]): string {
  const strengths = strongMatches.slice(0, 4).map((match) => match.requirement).join(", ") || "validated experience";
  const gaps = missingSkills.slice(0, 3).map((skill) => skill.skill).join(", ");
  const riskNote = risks.length > 0 ? " Ask about compensation and scope." : "";

  if (gaps.length > 0) {
    return `Lead with ${strengths}. Be honest about gaps around ${gaps}; position adjacent experience without overclaiming.${riskNote}`;
  }

  return `Lead with ${strengths}. Keep the application concise and evidence-based.${riskNote}`;
}

function extractMaxYears(text: string): number | null {
  const matches = [...text.matchAll(/(\d{1,2})\+?\s+years?/g)].map((match) => Number(match[1]));
  if (matches.length === 0) return null;
  return Math.max(...matches);
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}
