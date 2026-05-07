"""Rule-based MVP analyzer for CareerOS.

This module intentionally starts without LLM calls. The goal is to create a
small deterministic baseline that can later be compared against AI-assisted
analysis.
"""

from __future__ import annotations

import re

from .models import (
    MatchRecommendation,
    MatchReport,
    MissingSkill,
    RiskSignal,
    SalaryFit,
    SkillEvidence,
)

SKILL_ALIASES: dict[str, tuple[str, ...]] = {
    "API testing": ("api", "rest", "postman", "swagger", "openapi"),
    "SQL": ("sql", "join", "select", "database", "postgres", "mysql"),
    "FinTech": ("fintech", "bank", "banking", "brokerage", "investment", "reporting", "financial"),
    "Manual QA": ("manual qa", "manual testing", "test cases", "test design", "regression", "smoke"),
    "Logs and observability": ("logs", "kibana", "elastic", "sentry", "observability", "devtools"),
    "Microservices": ("microservice", "microservices", "client-server", "distributed"),
    "Docker": ("docker", "docker-compose", "container"),
    "Kafka": ("kafka", "event-driven", "queue", "streaming"),
    "Python": ("python", "pytest", "automation"),
    "CI/CD": ("ci/cd", "gitlab ci", "github actions", "pipeline"),
}

RISK_PATTERNS: tuple[tuple[str, str, str], ...] = (
    (
        "salary not specified",
        r"salary\s+(range\s+)?not\s+specified|salary\s+is\s+not\s+specified|no\s+salary|competitive\s+salary",
        "Could you share the compensation range for this role?",
    ),
    (
        "high stress wording",
        r"stress\s+resistance|high\s+pressure|fast-paced\s+environment|multitasking",
        "How is workload planned and prioritized during peak periods?",
    ),
    (
        "broad ownership without clear boundaries",
        r"wear\s+many\s+hats|do\s+everything|end-to-end\s+ownership|all\s+qa\s+processes",
        "What are the exact responsibilities and team boundaries for this role?",
    ),
    (
        "potentially large test task",
        r"test\s+task|practical\s+task|home\s+assignment",
        "How long does the practical task usually take, and is it based on a synthetic example?",
    ),
)

GROWTH_PATTERNS: tuple[str, ...] = (
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
)


def analyze_match(resume_text: str, vacancy_text: str) -> MatchReport:
    """Analyze a resume against a vacancy and return a structured report."""

    resume = _normalize(resume_text)
    vacancy = _normalize(vacancy_text)

    strong_matches = _detect_strong_matches(resume, vacancy)
    missing_skills = _detect_missing_skills(resume, vacancy)
    risks = _detect_risks(vacancy)

    match_score = _score_match(strong_matches, missing_skills)
    risk_score = _score_risk(risks)
    growth_score = _score_growth(vacancy)
    salary_fit = _detect_salary_fit(vacancy)
    recommendation = _recommend(match_score, risk_score, growth_score)
    strategy = _build_strategy(strong_matches, missing_skills, risks)

    return MatchReport(
        match_score=match_score,
        risk_score=risk_score,
        growth_score=growth_score,
        salary_fit=salary_fit,
        recommendation=recommendation,
        strong_matches=strong_matches,
        missing_skills=missing_skills,
        risks=risks,
        application_strategy=strategy,
    )


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def _contains_any(text: str, aliases: tuple[str, ...]) -> bool:
    return any(alias in text for alias in aliases)


def _detect_strong_matches(resume: str, vacancy: str) -> list[SkillEvidence]:
    matches: list[SkillEvidence] = []

    for skill, aliases in SKILL_ALIASES.items():
        if _contains_any(vacancy, aliases) and _contains_any(resume, aliases):
            matches.append(
                SkillEvidence(
                    requirement=skill,
                    evidence=f"Resume contains evidence for {skill}.",
                    confidence=0.85,
                )
            )

    years_resume = _extract_max_years(resume)
    years_vacancy = _extract_max_years(vacancy)
    if years_resume and years_vacancy and years_resume >= years_vacancy:
        matches.append(
            SkillEvidence(
                requirement=f"{years_vacancy}+ years of experience",
                evidence=f"Resume indicates {years_resume}+ years of experience.",
                confidence=0.95,
            )
        )

    return matches


def _detect_missing_skills(resume: str, vacancy: str) -> list[MissingSkill]:
    missing: list[MissingSkill] = []

    for skill, aliases in SKILL_ALIASES.items():
        if _contains_any(vacancy, aliases) and not _contains_any(resume, aliases):
            missing.append(
                MissingSkill(
                    skill=skill,
                    severity="medium" if skill in {"Kafka", "Docker", "Python"} else "high",
                    suggested_positioning=_positioning_for_missing_skill(skill),
                )
            )

    return missing


def _positioning_for_missing_skill(skill: str) -> str:
    if skill == "Kafka":
        return "Do not claim Kafka experience unless true. Mention adjacent microservice or integration testing experience if supported."
    if skill == "Docker":
        return "Mention Docker basics only if there is real hands-on experience with containers or local environments."
    if skill == "Python":
        return "Frame Python as automation transition interest unless production automation experience is proven."
    return f"Add honest evidence for {skill} or avoid overclaiming it."


def _detect_risks(vacancy: str) -> list[RiskSignal]:
    risks: list[RiskSignal] = []

    for label, pattern, question in RISK_PATTERNS:
        if re.search(pattern, vacancy):
            risks.append(RiskSignal(risk=label, severity="medium", question_to_ask=question))

    if "salary" not in vacancy and "compensation" not in vacancy:
        risks.append(
            RiskSignal(
                risk="salary range absent",
                severity="medium",
                question_to_ask="Could you share the compensation range for this role?",
            )
        )

    return risks


def _score_match(strong_matches: list[SkillEvidence], missing_skills: list[MissingSkill]) -> int:
    score = 45 + len(strong_matches) * 8 - len(missing_skills) * 5
    return _clamp(score, 0, 100)


def _score_risk(risks: list[RiskSignal]) -> int:
    score = len(risks) * 14
    return _clamp(score, 0, 100)


def _score_growth(vacancy: str) -> int:
    score = 45
    score += sum(6 for token in GROWTH_PATTERNS if token in vacancy)
    return _clamp(score, 0, 100)


def _detect_salary_fit(vacancy: str) -> SalaryFit:
    if "salary" not in vacancy and "compensation" not in vacancy:
        return SalaryFit.UNKNOWN
    if "not specified" in vacancy or "competitive" in vacancy:
        return SalaryFit.UNKNOWN
    return SalaryFit.NEEDS_NEGOTIATION


def _recommend(match_score: int, risk_score: int, growth_score: int) -> MatchRecommendation:
    if match_score >= 85 and risk_score <= 35:
        return MatchRecommendation.STRONG_APPLY
    if match_score >= 70 and risk_score <= 55:
        return MatchRecommendation.APPLY
    if match_score >= 60 and growth_score >= 75:
        return MatchRecommendation.APPLY_WITH_POSITIONING
    if match_score < 45 or risk_score >= 75:
        return MatchRecommendation.SKIP
    return MatchRecommendation.NEEDS_MORE_INFO


def _build_strategy(
    strong_matches: list[SkillEvidence],
    missing_skills: list[MissingSkill],
    risks: list[RiskSignal],
) -> str:
    strengths = ", ".join(match.requirement for match in strong_matches[:4]) or "validated experience"
    gaps = ", ".join(skill.skill for skill in missing_skills[:3])
    risk_note = " Ask about compensation and scope." if risks else ""

    if gaps:
        return f"Lead with {strengths}. Be honest about gaps around {gaps}; position adjacent experience without overclaiming.{risk_note}"
    return f"Lead with {strengths}. Keep the application concise and evidence-based.{risk_note}"


def _extract_max_years(text: str) -> int | None:
    years = [int(value) for value in re.findall(r"(\d{1,2})\+?\s+years?", text)]
    return max(years) if years else None


def _clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))
