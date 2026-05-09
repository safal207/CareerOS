import React, { useEffect, useState } from "react";
import {
  fetchCheckoutIntents,
  fetchWaitlistLeads,
  type CheckoutIntentLead,
  type WaitlistLead,
} from "./waitlistAdminClient.js";

type DashboardState = "loading" | "ready" | "error";

export function AdminDashboard() {
  const [state, setState] = useState<DashboardState>("loading");
  const [message, setMessage] = useState("Loading funnel signals...");
  const [leads, setLeads] = useState<WaitlistLead[]>([]);
  const [checkoutIntents, setCheckoutIntents] = useState<CheckoutIntentLead[]>([]);
  const [adminToken, setAdminToken] = useState(() => window.localStorage.getItem("careeros_admin_token") ?? "");

  async function loadDashboard(token = adminToken) {
    setState("loading");
    setMessage("Loading funnel signals...");

    const [waitlistResult, checkoutResult] = await Promise.all([
      fetchWaitlistLeads(token),
      fetchCheckoutIntents(token),
    ]);

    if (!waitlistResult.ok) {
      setState("error");
      setMessage(waitlistResult.message);
      return;
    }

    if (!checkoutResult.ok) {
      setState("error");
      setMessage(checkoutResult.message);
      return;
    }

    setLeads(waitlistResult.data.entries);
    setCheckoutIntents(checkoutResult.data.entries);
    setState("ready");
    setMessage(
      `${waitlistResult.data.count} waitlist lead${waitlistResult.data.count === 1 ? "" : "s"}; ${checkoutResult.data.count} checkout intent${checkoutResult.data.count === 1 ? "" : "s"}.`,
    );
  }

  function handleTokenSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem("careeros_admin_token", adminToken);
    void loadDashboard(adminToken);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const latestLead = leads[0];
  const latestCheckoutIntent = checkoutIntents[0];

  return (
    <main className="page-shell admin-page">
      <nav className="nav-bar">
        <a className="brand-mark" href="/">CareerOS</a>
        <a className="nav-cta" href="/">Back to funnel</a>
      </nav>

      <section className="admin-hero">
        <div>
          <div className="eyebrow">MVP Admin</div>
          <h1>Funnel signals dashboard.</h1>
          <p className="hero-lead">
            Inspect waitlist demand and $19 Job Search Pack purchase intent before adding a full CRM or payment integration.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={() => void loadDashboard()} disabled={state === "loading"}>
          {state === "loading" ? "Refreshing..." : "Refresh signals"}
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
        <AdminMetric label="Waitlist leads" value={String(leads.length)} />
        <AdminMetric label="$19 intents" value={String(checkoutIntents.length)} />
        <AdminMetric label="Latest buyer signal" value={latestCheckoutIntent?.email ?? latestLead?.email ?? "—"} />
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Checkout intents</h2>
            <p>{message}</p>
          </div>
          <span className="security-badge">Token-protected when CAREEROS_ADMIN_TOKEN is set</span>
        </div>

        {state === "error" ? <EmptyState title="Could not load funnel signals" text={message} /> : null}
        {state === "ready" && checkoutIntents.length === 0 ? (
          <EmptyState title="No checkout intents yet" text="Reserve the $19 pack from the funnel to capture the first purchase-intent signal." />
        ) : null}
        {checkoutIntents.length > 0 ? <CheckoutIntentsTable intents={checkoutIntents} /> : null}
      </section>

      <section className="admin-panel secondary-admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Waitlist leads</h2>
            <p>Top-of-funnel interest captured before purchase intent.</p>
          </div>
        </div>

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

function CheckoutIntentsTable({ intents }: { intents: CheckoutIntentLead[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Offer</th>
            <th>Price</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {intents.map((intent) => (
            <tr key={`${intent.email}-${intent.created_at}`}>
              <td>{intent.email}</td>
              <td>{intent.offer}</td>
              <td>${intent.price_usd}</td>
              <td>{intent.status}</td>
              <td>{formatDate(intent.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
