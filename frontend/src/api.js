const BASE = "/api";
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 10000, 10000, 10000];
const RETRYABLE_STATUSES = new Set([500, 502, 503, 504]);

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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function api(path, { method = "GET", body } = {}) {
  const s = getSession();
  const retrySafe = method === "GET" || (method === "POST" && path === "/login/");
  let res;

  for (let attempt = 0; ; attempt += 1) {
    try {
      res = await fetch(BASE + path, {
        method,
        headers: { "Content-Type": "application/json", ...(s ? { Authorization: `Token ${s.token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retrySafe || !RETRYABLE_STATUSES.has(res.status) || attempt >= RETRY_DELAYS.length) break;
    } catch (error) {
      if (!retrySafe || !(error instanceof TypeError) || attempt >= RETRY_DELAYS.length) throw error;
    }
    await wait(RETRY_DELAYS[attempt]);
  }

  if (res.status === 401) { setSession(null); window.location.href = "/login"; }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || Object.values(data).flat().join(" ") || "Request failed");
  return data;
}
