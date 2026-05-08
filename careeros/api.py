"""FastAPI application for CareerOS."""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

from .analyzer import analyze_match


class MatchRequest(BaseModel):
    """Request body for resume-vacancy analysis."""

    resume_text: str = Field(..., min_length=1, description="Candidate resume text")
    vacancy_text: str = Field(..., min_length=1, description="Vacancy text")


class HealthResponse(BaseModel):
    """Healthcheck response."""

    ok: bool
    service: str


def create_app() -> FastAPI:
    """Create and configure the CareerOS API app."""

    app = FastAPI(
        title="CareerOS API",
        description="Evidence-based resume-vacancy match analysis API.",
        version="0.1.0",
    )

    @app.get("/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse(ok=True, service="careeros")

    @app.post("/api/matches")
    def create_match(request: MatchRequest) -> dict[str, object]:
        report = analyze_match(
            resume_text=request.resume_text,
            vacancy_text=request.vacancy_text,
        )
        return report.to_dict()

    return app


app = create_app()
