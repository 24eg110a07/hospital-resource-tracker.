import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { getSession, setSession } from "./api";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Resources from "./pages/Resources.jsx";
import Requests from "./pages/Requests.jsx";
import { CONFIGS } from "./config.js";

function Layout({ children }) {
  const session = getSession();
  const nav = useNavigate();

  if (!session) return null;

  const navigation = [
    { to: "/", label: "Dashboard", mark: "D", end: true },
    ...Object.entries(CONFIGS).map(([key, config]) => ({ to: `/${key}`, label: config.title, mark: config.title[0] })),
    { to: "/requests", label: "Requests", mark: "R" },
  ];

  return (
    <div className="shell">
      <aside>
        <div className="brand">
          <img className="brand-logo" src="/caregrid-logo.svg" alt="" />
          <div><h1>CareGrid</h1><span>Hospital resources</span></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navigation.map(({ to, label, mark, end }) => (
            <NavLink key={to} to={to} end={end}>
              <span className="nav-mark" aria-hidden="true">{mark}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div className="me">
          <span className="avatar" aria-hidden="true">{session.username[0]?.toUpperCase() || "U"}</span>
          <span className="user-details"><strong>{session.username}</strong><em>{session.role}</em></span>
          <button className="sign-out" onClick={() => { setSession(null); nav("/login"); }}>Sign out</button>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}

const Guard = ({ children }) => {
  const session = getSession();
  return session ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Guard><Dashboard /></Guard>} />
      {Object.keys(CONFIGS).map((k) => <Route key={k} path={`/${k}`} element={<Guard><Resources key={k} kind={k} /></Guard>} />)}
      <Route path="/requests" element={<Guard><Requests /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
