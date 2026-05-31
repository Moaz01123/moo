const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8001").replace(/\/$/, "");

function authHeaders() {
  const token = localStorage.getItem("kavo_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json", ...(auth ? authHeaders() : {}) };
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch (_) {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  url: API_URL,
  // public
  getProducts: (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null)
    ).toString();
    return request(`/api/products${q ? `?${q}` : ""}`);
  },
  getProduct: (slug) => request(`/api/products/${slug}`),
  getCategories: () => request("/api/categories"),
  getSettings: () => request("/api/settings"),
  createOrder: (payload) => request("/api/orders", { method: "POST", body: payload }),
  getOrder: (id) => request(`/api/orders/${id}`),
  chat: (message, session_id) =>
    request("/api/chat", { method: "POST", body: { message, session_id } }),

  // auth
  login: (username, password) =>
    request("/api/auth/login", { method: "POST", body: { username, password } }),
  me: () => request("/api/auth/me", { auth: true }),

  // admin
  adminStats: () => request("/api/admin/stats", { auth: true }),
  adminProducts: () => request("/api/admin/products", { auth: true }),
  adminCreateProduct: (p) => request("/api/admin/products", { method: "POST", body: p, auth: true }),
  adminUpdateProduct: (id, p) =>
    request(`/api/admin/products/${id}`, { method: "PUT", body: p, auth: true }),
  adminDeleteProduct: (id) =>
    request(`/api/admin/products/${id}`, { method: "DELETE", auth: true }),
  adminCreateCategory: (c) =>
    request("/api/admin/categories", { method: "POST", body: c, auth: true }),
  adminOrders: () => request("/api/admin/orders", { auth: true }),
  adminUpdateOrderStatus: (id, status) =>
    request(`/api/admin/orders/${id}/status`, { method: "PUT", body: { status }, auth: true }),
  adminGetSettings: () => request("/api/admin/settings", { auth: true }),
  adminUpdateSettings: (data) =>
    request("/api/admin/settings", { method: "PUT", body: { data }, auth: true }),
};
