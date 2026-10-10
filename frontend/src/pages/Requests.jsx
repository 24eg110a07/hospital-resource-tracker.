import { useEffect, useState } from "react";
import { api, getSession } from "../api";
import { label } from "../config";

export default function Requests() {
  const isAdmin = getSession().role === "admin";
  const [rows, setRows] = useState([]); const [f, setF] = useState({ resource_type: "bed", details: "" }); const [err, setErr] = useState("");
  const load = () => api("/requests/").then(setRows).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  async function submit(e) {
    e.preventDefault(); setErr("");
    try { await api("/requests/", { method: "POST", body: f }); setF({ ...f, details: "" }); load(); } catch (x) { setErr(x.message); }
  }
  const decide = async (r, status) => { await api(`/requests/${r.id}/`, { method: "PATCH", body: { status } }); load(); };
  return (
    <>
      <h2>Resource requests</h2>
      <form className="inline" onSubmit={submit}>
        <select value={f.resource_type} onChange={(e) => setF({ ...f, resource_type: e.target.value })}>
          {["bed", "doctor", "staff", "equipment"].map((t) => <option key={t} value={t}>{label(t)}</option>)}
        </select>
        <input placeholder="What do you need, and where?" value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} required />
        <button>Send request</button>
      </form>
      {err && <div className="error">{err}</div>}
      <div className="scroll"><table>
        <thead><tr><th>Requested by</th><th>Resource</th><th>Details</th><th>Status</th>{isAdmin && <th />}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}><td>{r.requested_by_name}</td><td>{label(r.resource_type)}</td><td>{r.details}</td>
              <td><span className={`pill ${r.status}`}>{label(r.status)}</span></td>
              {isAdmin && <td className="actions">{r.status === "pending" && <>
                <button className="ghost" onClick={() => decide(r, "approved")}>Approve</button>
                <button className="ghost danger" onClick={() => decide(r, "rejected")}>Reject</button></>}</td>}
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan="5" className="empty">No requests yet. Send one above.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}
