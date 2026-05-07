"""Typed data models for CareerOS core analysis.

The first implementation uses standard-library dataclasses so the MVP can run
without external dependencies.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import StrEnum
from typing import Any


class MatchRecommendation(StrEnum):
    """Action recommendation for a resume-vacancy pair."""

    STRONG_APPLY = "strong_apply"
    APPLY = "apply"
    APPLY_WITH_POSITIONING = "apply_with_positioning"
    SKIP = "skip"
    NEEDS_MORE_INFO = "needs_more_info"


class SalaryFit(StrEnum):
    """Salary fit classification."""

    GOOD_FIT = "good_fit"
    BELOW_EXPECTATION = "below_expectation"
    ABOVE_EXPECTATION = "above_expectation"
    UNKNOWN = "unknown"
    NEEDS_NEGOTIATION = "needs_negotiation"


@dataclass(frozen=True)
class SkillEvidence:
    """Evidence that connects a vacancy requirement to resume content."""

    requirement: str
    evidence: str
    confidence: float


@dataclass(frozen=True)
class MissingSkill:
    """A required or useful skill that is not clearly proven in the resume."""

    skill: str
    severity: str
    suggested_positioning: str


@dataclass(frozen=True)
class RiskSignal:
    """A risk detected in the vacancy or candidate-vacancy fit."""

    risk: str
    severity: str
    question_to_ask: str | None = None


@dataclass(frozen=True)
class MatchReport:
    """Structured output of the MVP analyzer."""

    match_score: int
    risk_score: int
    growth_score: int
    salary_fit: SalaryFit
    recommendation: MatchRecommendation
    strong_matches: list[SkillEvidence] = field(default_factory=list)
    missing_skills: list[MissingSkill] = field(default_factory=list)
    risks: list[RiskSignal] = field(default_factory=list)
    application_strategy: str = ""

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-serializable dictionary."""

        payload = asdict(self)
        payload["salary_fit"] = self.salary_fit.value
        payload["recommendation"] = self.recommendation.value
        return payload
