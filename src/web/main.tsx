import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { analyzeMatch } from "../analyzer.js";
import type { MatchReport } from "../models.js";
import "./styles.css";

const sampleResume = `Senior QA Engineer with 12+ years of experience in fintech, banking, reporting systems, REST API testing, Postman, Swagger, SQL validation, regression testing, smoke testing, logs, Kibana, Elastic, Sentry, Chrome DevTools, and microservice testing.`;

const sampleVacancy = `Senior QA Engineer for a fintech platform. Requirements: 5+ years of QA experience, manual testing, API testing with Postman or Swagger, SQL skills for data validation, experience with banking, brokerage, investment, or reporting products. Nice to have: Kafka, Docker, Python automation. Salary range not specified.`;

function App() {
  const [resumeText, setResumeText] = useState(sampleResume);
  const [vacancyText, setVacancyText] = useState(sampleVacancy);
  const [report, setReport] = useState<MatchReport>(() => analyzeMatch(sampleResume, sampleVacancy));

  const recommendationLabel = useMemo(() => formatLabel(report.recommendation), [report.recommendation]);

  function handleAnalyze() {
    setReport(analyzeMatch(resumeText, vacancyText));
  }

  return (
    <main className="page-shell">
      <section className="hero-section">
        <nav className="nav-bar">
          <div className="brand-mark">CareerOS</div>
          <a className="nav-cta" href="#analyzer">Run free audit</a>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">ClickFunnels × PLF × SamCart style MVP</div>
            <h1>Turn one vacancy into a high-conviction application plan.</h1>
            <p className="hero-lead">
              CareerOS scores the fit, exposes gaps, detects risks, and gives you the exact positioning angle before you apply.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#analyzer">Analyze my fit</a>
              <a className="secondary-button" href="#value-stack">See value stack</a>
            </div>
            <div className="trust-row">
              <span>Evidence-first</span>
              <span>No fake experience</span>
              <span>Human-in-control</span>
            </div>
          </div>

          <div className="offer-card">
            <div className="card-kicker">Free Lead Magnet</div>
            <h2>Instant Job Fit Audit</h2>
            <p>
              Paste your resume and vacancy. Get a structured report you can use before sending a response.
            </p>
            <div className="score-preview">
              <div>
                <strong>{report.match_score}</strong>
                <span>Match</span>
              </div>
              <div>
                <strong>{report.risk_score}</strong>
                <span>Risk</span>
              </div>
              <div>
                <strong>{report.growth_score}</strong>
                <span>Growth</span>
              </div>
            </div>
            <div className="price-anchor">
              <span>Value: $49</span>
              <strong>Free in MVP</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="value-stack" className="value-section">
        <div className="section-heading">
          <span>Product Launch Formula</span>
          <h2>From chaos to career pipeline.</h2>
          <p>We do not give you “more vacancies”. We give you a decision system.</p>
        </div>
        <div className="value-grid">
          <ValueCard title="1. Diagnose" text="Reveal whether the role is worth your attention before emotional overinvestment." />
          <ValueCard title="2. Position" text="Turn your real evidence into a sharper application angle without inventing experience." />
          <ValueCard title="3. Convert" text="Move from saved vacancy to ready-to-send response with less friction." />
        </div>
      </section>

      <section id="analyzer" className="analyzer-section">
        <div className="section-heading compact">
          <span>Value Moment</span>
          <h2>Run the instant fit audit.</h2>
          <p>This is the first SamCart-style conversion event: user enters data and receives immediate clarity.</p>
        </div>

        <div className="analyzer-grid">
          <div className="input-panel">
            <label>
              Resume
              <textarea value={resumeText} onChange={(event) => setResumeText(event.target.value)} />
            </label>
            <label>
              Vacancy
              <textarea value={vacancyText} onChange={(event) => setVacancyText(event.target.value)} />
            </label>
            <button className="primary-button full-width" type="button" onClick={handleAnalyze}>
              Generate my application plan
            </button>
          </div>

          <ResultPanel report={report} recommendationLabel={recommendationLabel} />
        </div>
      </section>

      <section className="checkout-section">
        <div>
          <span className="eyebrow">Next paid offer</span>
          <h2>“Apply to 10 better-fit jobs this week.”</h2>
          <p>
            The natural SamCart offer after the free audit: save multiple vacancies, rank them, generate tailored responses, and track your pipeline.
          </p>
        </div>
        <a className="primary-button" href="#analyzer">Start with one free audit</a>
      </section>
    </main>
  );
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="value-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function ResultPanel({ report, recommendationLabel }: { report: MatchReport; recommendationLabel: string }) {
  return (
    <aside className="result-panel">
      <div className="result-header">
        <span>Recommendation</span>
        <strong>{recommendationLabel}</strong>
      </div>

      <div className="metric-grid">
        <Metric label="Match" value={report.match_score} />
        <Metric label="Risk" value={report.risk_score} />
        <Metric label="Growth" value={report.growth_score} />
      </div>

      <div className="result-block">
        <h3>Application strategy</h3>
        <p>{report.application_strategy}</p>
      </div>

      <div className="result-block">
        <h3>Strong matches</h3>
        <ul>
          {report.strong_matches.slice(0, 5).map((match) => (
            <li key={match.requirement}>{match.requirement}</li>
          ))}
        </ul>
      </div>

      <div className="result-block">
        <h3>Gaps / risks</h3>
        <ul>
          {[...report.missing_skills.map((skill) => skill.skill), ...report.risks.map((risk) => risk.risk)]
            .slice(0, 6)
            .map((item) => (
              <li key={item}>{item}</li>
            ))}
        </ul>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

createRoot(document.getElementById("root")!).render(<App />);
