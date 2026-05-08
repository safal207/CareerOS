from fastapi.testclient import TestClient

from careeros.api import create_app


RESUME = """
Senior QA Engineer with 12+ years of experience in fintech, API testing,
Postman, Swagger, SQL validation, banking systems, and regression testing.
"""

VACANCY = """
Senior QA Engineer for a fintech platform. Requirements: 5+ years of QA experience,
API testing with Postman, SQL skills, banking or reporting products. Nice to have: Kafka.
Salary range not specified.
"""


def test_health_endpoint() -> None:
    client = TestClient(create_app())

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"ok": True, "service": "careeros"}


def test_create_match_endpoint_returns_match_report() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/api/matches",
        json={"resume_text": RESUME, "vacancy_text": VACANCY},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["match_score"] >= 70
    assert payload["salary_fit"] == "unknown"
    assert payload["recommendation"] in {"strong_apply", "apply"}
    assert isinstance(payload["strong_matches"], list)
    assert isinstance(payload["missing_skills"], list)
    assert isinstance(payload["risks"], list)


def test_create_match_endpoint_validates_empty_input() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/api/matches",
        json={"resume_text": "", "vacancy_text": VACANCY},
    )

    assert response.status_code == 422
