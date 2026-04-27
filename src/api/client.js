export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

function getAuthToken() {
  const saved = localStorage.getItem("sns_todo_auth");

  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    return parsed.token;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getAuthToken();

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  return null;
}
