import json
from pathlib import Path

from careeros.analyzer import analyze_match


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "schemas" / "match-report.schema.json"

RESUME = """
Senior QA Engineer with 12+ years of experience in fintech, REST API testing,
Postman, Swagger, SQL validation, banking systems, logs, and regression testing.
"""

VACANCY = """
Senior QA Engineer for a fintech platform. Requirements: 5+ years of QA experience,
API testing, Postman, SQL, banking or reporting products. Nice to have: Kafka.
Salary range not specified.
"""


def test_match_report_schema_file_is_valid_json() -> None:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))

    assert schema["title"] == "CareerOS MatchReport"
    assert "properties" in schema
    assert "recommendation" in schema["properties"]


def test_match_report_output_matches_contract_shape() -> None:
    report = analyze_match(RESUME, VACANCY).to_dict()

    assert set(report) == {
        "match_score",
        "risk_score",
        "growth_score",
        "salary_fit",
        "recommendation",
        "strong_matches",
        "missing_skills",
        "risks",
        "application_strategy",
    }

    assert isinstance(report["match_score"], int)
    assert 0 <= report["match_score"] <= 100
    assert isinstance(report["risk_score"], int)
    assert 0 <= report["risk_score"] <= 100
    assert isinstance(report["growth_score"], int)
    assert 0 <= report["growth_score"] <= 100
    assert isinstance(report["salary_fit"], str)
    assert isinstance(report["recommendation"], str)
    assert isinstance(report["strong_matches"], list)
    assert isinstance(report["missing_skills"], list)
    assert isinstance(report["risks"], list)
    assert isinstance(report["application_strategy"], str)

    for match in report["strong_matches"]:
        assert set(match) == {"requirement", "evidence", "confidence"}
        assert isinstance(match["requirement"], str)
        assert isinstance(match["evidence"], str)
        assert isinstance(match["confidence"], float)
        assert 0 <= match["confidence"] <= 1

    for skill in report["missing_skills"]:
        assert set(skill) == {"skill", "severity", "suggested_positioning"}
        assert skill["severity"] in {"low", "medium", "high"}

    for risk in report["risks"]:
        assert set(risk) == {"risk", "severity", "question_to_ask"}
        assert risk["severity"] in {"low", "medium", "high"}
        assert risk["question_to_ask"] is None or isinstance(risk["question_to_ask"], str)
