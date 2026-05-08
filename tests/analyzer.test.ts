import { describe, expect, it } from "vitest";
import { analyzeMatch } from "../src/analyzer.js";

const resume = `
Senior QA Engineer with 12+ years of experience in fintech, banking, reporting systems,
REST API testing, Postman, Swagger, SQL validation, regression testing, smoke testing,
logs, Kibana, Elastic, Sentry, Chrome DevTools, and microservice testing.
`;

const vacancy = `
Senior QA Engineer for a fintech platform. Requirements: 5+ years of QA experience,
manual testing, API testing with Postman or Swagger, SQL skills for data validation,
experience with banking, brokerage, investment, or reporting products. Nice to have:
Kafka, Docker, Python automation. Salary range not specified.
`;

const riskyVacancy = `
QA Engineer needed in a fast-paced environment. Must show stress resistance,
wear many hats, own all QA processes, and complete a practical test task.
`;

describe("analyzeMatch", () => {
  it("detects a strong fintech QA fit", () => {
    const report = analyzeMatch(resume, vacancy);

    expect(report.match_score).toBeGreaterThanOrEqual(70);
    expect(["strong_apply", "apply"]).toContain(report.recommendation);
    expect(report.strong_matches.some((match) => match.requirement === "API testing")).toBe(true);
    expect(report.strong_matches.some((match) => match.requirement === "SQL")).toBe(true);
    expect(report.strong_matches.some((match) => match.requirement === "FinTech")).toBe(true);
  });

  it("detects missing nice-to-have skills", () => {
    const report = analyzeMatch(resume, vacancy);
    const missing = new Set(report.missing_skills.map((skill) => skill.skill));

    expect(missing.has("Kafka")).toBe(true);
    expect(missing.has("Docker")).toBe(true);
    expect(missing.has("Python")).toBe(true);
  });

  it("detects unknown salary", () => {
    const report = analyzeMatch(resume, vacancy);

    expect(report.salary_fit).toBe("unknown");
    expect(report.risks.some((risk) => risk.risk.includes("salary"))).toBe(true);
  });

  it("flags risky wording", () => {
    const report = analyzeMatch(resume, riskyVacancy);
    const riskNames = new Set(report.risks.map((risk) => risk.risk));

    expect(riskNames.has("high stress wording")).toBe(true);
    expect(riskNames.has("broad ownership without clear boundaries")).toBe(true);
    expect(riskNames.has("potentially large test task")).toBe(true);
    expect(report.risk_score).toBeGreaterThanOrEqual(40);
  });
});
