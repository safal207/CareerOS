"""Command-line interface for the CareerOS MVP analyzer."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from .analyzer import analyze_match


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="careeros",
        description="Analyze resume-vacancy fit and produce an evidence-based match report.",
    )
    parser.add_argument("--resume", required=True, help="Path to resume text/Markdown file")
    parser.add_argument("--vacancy", required=True, help="Path to vacancy text/Markdown file")
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print JSON output with indentation",
    )

    args = parser.parse_args()

    resume_text = Path(args.resume).read_text(encoding="utf-8")
    vacancy_text = Path(args.vacancy).read_text(encoding="utf-8")

    report = analyze_match(resume_text=resume_text, vacancy_text=vacancy_text)
    indent = 2 if args.pretty else None
    print(json.dumps(report.to_dict(), ensure_ascii=False, indent=indent))


if __name__ == "__main__":
    main()
