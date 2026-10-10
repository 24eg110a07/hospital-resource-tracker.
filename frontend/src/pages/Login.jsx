import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setSession } from "../api";

export default function Login() {
  const [f, setF] = useState({ username: "", password: "" }); const [err, setErr] = useState(""); const nav = useNavigate();
  async function submit(e) {
    e.preventDefault(); setErr("");
    try { setSession(await api("/login/", { method: "POST", body: f })); nav("/"); } catch (x) { setErr(x.message); }
  }
  return (
    <div className="login">
      <div className="login-story">
        <img className="login-logo" src="/caregrid-logo.svg" alt="" />
        <span className="eyebrow">HOSPITAL RESOURCE TRACKER</span>
        <h1>Care that works<br />better together.</h1>
        <p>A clear view of the people, beds and equipment supporting your hospital.</p>
        <div className="login-tags"><span>Bed availability</span><span>Care teams</span><span>Equipment</span></div>
      </div>
      <form onSubmit={submit}>
        <span className="form-kicker">WELCOME BACK</span>
        <h2>Sign in to CareGrid</h2>
        <p>Use your hospital account to continue.</p>
        <label>Username<input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} autoFocus required /></label>
        <label>Password<input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></label>
        {err && <div className="error">{err}</div>}
        <button className="login-submit">Sign in <span aria-hidden="true">→</span></button>
      </form>
    </div>
  );
}
