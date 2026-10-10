const BASE = "/api";
export const getSession = () => {
  try {
    const raw = localStorage.getItem("session");
    if (!raw) return null;
    const value = JSON.parse(raw);
    return value && typeof value === "object" ? value : null;
  } catch {
    localStorage.removeItem("session");
    return null;
  }
};
export const setSession = (s) => (s ? localStorage.setItem("session", JSON.stringify(s)) : localStorage.removeItem("session"));

export async function api(path, { method = "GET", body } = {}) {
  const s = getSession();
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(s ? { Authorization: `Token ${s.token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { setSession(null); window.location.href = "/login"; }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || Object.values(data).flat().join(" ") || "Request failed");
  return data;
}
