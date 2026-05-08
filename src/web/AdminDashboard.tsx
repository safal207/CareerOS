import React, { useEffect, useState } from "react";
import { fetchWaitlistLeads, type WaitlistLead } from "./waitlistAdminClient.js";

type DashboardState = "loading" | "ready" | "error";

export function AdminDashboard() {
  const [state, setState] = useState<DashboardState>("loading");
  const [message, setMessage] = useState("Loading waitlist leads...");
  const [leads, setLeads] = useState<WaitlistLead[]>([]);
  const [adminToken, setAdminToken] = useState(() => window.localStorage.getItem("careeros_admin_token") ?? "");

  async function loadLeads(token = adminToken) {
    setState("loading");
    setMessage("Loading waitlist leads...");

    const result = await fetchWaitlistLeads(token);

    if (!result.ok) {
      setState("error");
      setMessage(result.message);
      return;
    }

    setLeads(result.data.entries);
    setState("ready");
    setMessage(`${result.data.count} captured lead${result.data.count === 1 ? "" : "s"}.`);
  }

  function handleTokenSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem("careeros_admin_token", adminToken);
    void loadLeads(adminToken);
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  const latestLead = leads[0];

  return (
    <main className="page-shell admin-page">
      <nav className="nav-bar">
        <a className="brand-mark" href="/">CareerOS</a>
        <a className="nav-cta" href="/">Back to funnel</a>
      </nav>

      <section className="admin-hero">
        <div>
          <div className="eyebrow">MVP Admin</div>
          <h1>Waitlist leads dashboard.</h1>
          <p className="hero-lead">
            Inspect captured launch interest for the $19 Job Search Pack before adding a full CRM or payment integration.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={() => void loadLeads()} disabled={state === "loading"}>
          {state === "loading" ? "Refreshing..." : "Refresh leads"}
        </button>
      </section>

      <section className="admin-token-panel">
        <form className="admin-token-form" onSubmit={handleTokenSubmit}>
          <label>
            Admin token
            <input
              type="password"
              placeholder="CAREEROS_ADMIN_TOKEN"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
            />
          </label>
          <button className="primary-button" type="submit">Save token</button>
        </form>
        <p>Used only in this browser via localStorage and sent as <code>x-admin-token</code>.</p>
      </section>

      <section className="admin-metrics">
        <AdminMetric label="Total leads" value={String(leads.length)} />
        <AdminMetric label="Latest source" value={latestLead?.source ?? "—"} />
        <AdminMetric label="Primary offer" value={latestLead?.offer ?? "—"} />
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Captured leads</h2>
            <p>{message}</p>
          </div>
          <span className="security-badge">Token-protected when CAREEROS_ADMIN_TOKEN is set</span>
        </div>

        {state === "error" ? <EmptyState title="Could not load leads" text={message} /> : null}
        {state === "ready" && leads.length === 0 ? (
          <EmptyState title="No leads yet" text="Run the funnel and submit the waitlist form to capture the first lead." />
        ) : null}
        {leads.length > 0 ? <LeadsTable leads={leads} /> : null}
      </section>
    </main>
  );
}

function AdminMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="admin-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function LeadsTable({ leads }: { leads: WaitlistLead[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Source</th>
            <th>Offer</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={`${lead.email}-${lead.created_at}`}>
              <td>{lead.email}</td>
              <td>{lead.source}</td>
              <td>{lead.offer}</td>
              <td>{formatDate(lead.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
