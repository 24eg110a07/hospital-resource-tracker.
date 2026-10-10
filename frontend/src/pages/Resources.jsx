import { useEffect, useState } from "react";
import { api, getSession } from "../api";
import { CONFIGS, label } from "../config";

export default function Resources({ kind }) {
  const cfg = CONFIGS[kind]; const isAdmin = getSession().role === "admin";
  const [rows, setRows] = useState([]); const [q, setQ] = useState(""); const [status, setStatus] = useState("");
  const [edit, setEdit] = useState(null); const [err, setErr] = useState("");
  const statuses = cfg.fields.find((f) => f[0] === "status")[2];

  const load = () => api(`/${kind}/?search=${encodeURIComponent(q)}&status=${status}`).then(setRows).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [q, status]);

  async function save(e) {
    e.preventDefault(); setErr("");
    try {
      await api(edit.id ? `/${kind}/${edit.id}/` : `/${kind}/`, { method: edit.id ? "PUT" : "POST", body: edit });
      setEdit(null); load();
    } catch (x) { setErr(x.message); }
  }
  async function remove(id) {
    if (confirm(`Delete this ${cfg.singular}?`)) { await api(`/${kind}/${id}/`, { method: "DELETE" }); load(); }
  }
  const blank = Object.fromEntries(cfg.fields.map(([k, , o, t]) => [k, o ? o[0][0] : t === "number" ? 1 : ""]));

  return (
    <>
      <div className="bar">
        <h2>{cfg.title}</h2>
        <input placeholder={`Search ${cfg.title.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>{statuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {isAdmin && <button onClick={() => setEdit(blank)}>Add {cfg.singular}</button>}
      </div>
      {err && <div className="error">{err}</div>}
      <div className="scroll"><table>
        <thead><tr>{cfg.columns.map((c) => <th key={c}>{label(c)}</th>)}{isAdmin && <th />}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {cfg.columns.map((c) => <td key={c}>{c === "status" ? <span className={`pill ${r[c]}`}>{label(r[c])}</span> : r[c]}</td>)}
              {isAdmin && <td className="actions"><button className="ghost" onClick={() => setEdit(r)}>Edit</button><button className="ghost danger" onClick={() => remove(r.id)}>Delete</button></td>}
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan="9" className="empty">Nothing matches. Clear the search or filter.</td></tr>}
        </tbody>
      </table></div>
      {edit && (
        <div className="modal" onClick={() => setEdit(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h3>{edit.id ? "Edit" : "Add"} {cfg.singular}</h3>
            {cfg.fields.map(([k, l, opts, type]) => (
              <label key={k}>{l}
                {opts ? <select value={edit[k]} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })}>{opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
                  : <input type={type || "text"} min="0" value={edit[k]} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} required={k !== "schedule" && k !== "shift"} />}
              </label>
            ))}
            <div className="actions"><button type="button" className="ghost" onClick={() => setEdit(null)}>Cancel</button><button>Save changes</button></div>
          </form>
        </div>
      )}
    </>
  );
}
