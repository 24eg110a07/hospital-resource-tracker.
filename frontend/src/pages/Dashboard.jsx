import { useEffect, useState } from "react";
import { api } from "../api";
import { CONFIGS, label } from "../config";

export default function Dashboard() {
  const [d, setD] = useState(null); const [err, setErr] = useState("");
  useEffect(() => { api("/dashboard/").then(setD).catch((e) => setErr(e.message)); }, []);
  if (err) return <div className="error">{err}</div>;
  if (!d) return <p>Loading…</p>;

  const readyStatuses = ["available", "on_duty", "active"];
  const sum = (statuses) => Object.values(statuses).reduce((total, count) => total + count, 0);
  const teamOnDuty = (d.doctors.on_duty || 0) + (d.staff.on_duty || 0);
  const summary = [
    { label: "Beds available", value: d.beds.available || 0, detail: `of ${sum(d.beds)} beds tracked`, tone: "aqua", mark: "B" },
    { label: "Care team on duty", value: teamOnDuty, detail: `${sum(d.doctors) + sum(d.staff)} doctors & staff tracked`, tone: "violet", mark: "T" },
    { label: "Critical patients", value: d.patients.critical || 0, detail: `${d.patients.active || 0} active patients tracked`, tone: "rose", mark: "P" },
    { label: "Equipment maintenance", value: d.equipment.maintenance || 0, detail: `${sum(d.equipment)} equipment items tracked`, tone: "amber", mark: "E" },
    { label: "Pending requests", value: d.pending_requests, detail: "Waiting for review", tone: "rose", mark: "R" },
  ];

  return (
    <>
      <header className="page-heading">
        <div><span className="eyebrow">HOSPITAL OPERATIONS</span><h2>Dashboard</h2>
          <p>A detailed snapshot of capacity, teams and equipment.</p></div>
        <span className="live-indicator"><i />Live overview</span>
      </header>
      <section className={`notice ${d.alerts.length ? "notice-alert" : "notice-ok"}`}>
        <span className="notice-icon" aria-hidden="true">{d.alerts.length ? "!" : "✓"}</span>
        <div><strong>{d.alerts.length ? "Attention needed" : "All systems looking good"}</strong>
          <span>{d.alerts.length ? d.alerts.join(" ") : "No active alerts. Resources look healthy."}</span></div>
      </section>
      <section className="summary-grid" aria-label="Operational highlights">
        {summary.map((item) => (
          <article className={`summary-card summary-${item.tone}`} key={item.label}>
            <div className="summary-top"><span>{item.label}</span><b aria-hidden="true">{item.mark}</b></div>
            <strong>{item.value}</strong><small>{item.detail}</small>
          </article>
        ))}
      </section>
      <div className="section-heading"><div><span className="eyebrow">RESOURCE BREAKDOWN</span><h2>Availability by team</h2></div>
        <span className="section-note">Status counts and readiness</span></div>
      <div className="grid">
        {Object.entries(CONFIGS).map(([k, c]) => (
          <section className={`card resource-card tone-${k}`} key={k}>
            <div className="card-heading"><div><span className="card-kicker">RESOURCE</span><h3>{c.title}</h3></div>
              <span className="card-symbol" aria-hidden="true">{c.title[0]}</span></div>
            {(() => {
              const total = Object.values(d[k]).reduce((sum, count) => sum + count, 0);
              const ready = Object.entries(d[k]).filter(([status]) => readyStatuses.includes(status))
                .reduce((sum, [, count]) => sum + count, 0);
              const percentage = total ? Math.round((ready / total) * 100) : 0;
              return (
                <>
                  <div className="metric-line"><div><span className="total">{total}</span><span className="metric-caption">tracked</span></div>
                    <div className="availability-ring" style={{ "--progress": percentage }} role="img" aria-label={`${percentage}% available`}>
                      <span>{percentage}%</span></div></div>
                  <div className="distribution" aria-label={`${c.title} status distribution`}>
                    {Object.entries(d[k]).map(([status, count]) => <span key={status} className={`distribution-segment ${status}`}
                      style={{ width: `${total ? (count / total) * 100 : 0}%` }} />)}
                  </div>
                  <div className="resource-statuses">
                    {Object.entries(d[k]).map(([status, count]) =>
                      <div className="row" key={status}><span className={`dot ${status}`} />{label(status)}<b>{count}</b></div>)}
                    {Object.keys(d[k]).length === 0 && <div className="row muted-row">No resources recorded yet</div>}
                  </div>
                </>
              );
            })()}
          </section>
        ))}
        <section className="card request-card">
          <div className="card-heading"><div><span className="card-kicker">WORKFLOW</span><h3>Pending requests</h3></div>
            <span className="card-symbol" aria-hidden="true">↗</span></div>
          <div className="total">{d.pending_requests}</div>
          <span className="request-caption">Awaiting admin review</span>
        </section>
      </div>
    </>
  );
}
