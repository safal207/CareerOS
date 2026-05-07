from careeros.analyzer import analyze_match
from careeros.models import MatchRecommendation, SalaryFit


RESUME = """
Senior QA Engineer with 12+ years of experience in fintech, banking, reporting systems,
REST API testing, Postman, Swagger, SQL validation, regression testing, smoke testing,
logs, Kibana, Elastic, Sentry, Chrome DevTools, and microservice testing.
"""

VACANCY = """
Senior QA Engineer for a fintech platform. Requirements: 5+ years of QA experience,
manual testing, API testing with Postman or Swagger, SQL skills for data validation,
experience with banking, brokerage, investment, or reporting products. Nice to have:
Kafka, Docker, Python automation. Salary range not specified.
"""

RISKY_VACANCY = """
QA Engineer needed in a fast-paced environment. Must show stress resistance,
wear many hats, own all QA processes, and complete a practical test task.
"""


def test_analyze_match_detects_strong_fintech_qa_fit() -> None:
    report = analyze_match(RESUME, VACANCY)

    assert report.match_score >= 70
    assert report.recommendation in {
        MatchRecommendation.STRONG_APPLY,
        MatchRecommendation.APPLY,
    }
    assert any(match.requirement == "API testing" for match in report.strong_matches)
    assert any(match.requirement == "SQL" for match in report.strong_matches)
    assert any(match.requirement == "FinTech" for match in report.strong_matches)


def test_analyze_match_detects_missing_nice_to_have_skills() -> None:
    report = analyze_match(RESUME, VACANCY)
    missing = {skill.skill for skill in report.missing_skills}

    assert "Kafka" in missing
    assert "Docker" in missing
    assert "Python" in missing


def test_analyze_match_detects_salary_unknown() -> None:
    report = analyze_match(RESUME, VACANCY)

    assert report.salary_fit == SalaryFit.UNKNOWN
    assert any("salary" in risk.risk for risk in report.risks)


def test_analyze_match_flags_risky_wording() -> None:
    report = analyze_match(RESUME, RISKY_VACANCY)
    risk_names = {risk.risk for risk in report.risks}

    assert "high stress wording" in risk_names
    assert "broad ownership without clear boundaries" in risk_names
    assert "potentially large test task" in risk_names
    assert report.risk_score >= 40
