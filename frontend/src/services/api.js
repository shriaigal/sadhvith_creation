// Central API client for the FastAPI backend. No component should ever
// call fetch("http://...") directly — everything goes through here, so
// the base URL, auth header, and error handling only live in one place.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const TOKEN_KEY = "sadhvith_manager_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, isForm = false, auth = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(
      "Could not reach the server. Please check your connection and try again.",
      0
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // No JSON body (e.g. a network-level failure page) — fall through.
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      setToken(null);
    }
    const message = data?.message || `Request failed (${response.status}).`;
    throw new ApiError(message, response.status);
  }

  return data;
}

// ---- Auth ----
export const authApi = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me", { auth: true }),
  logout: () => request("/auth/logout", { method: "POST", auth: true }),
};

// ---- Public products ----
export const productsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    return request(`/products${query ? `?${query}` : ""}`);
  },
  getBySlug: (slug) => request(`/products/${encodeURIComponent(slug)}`),
};

// ---- Manager product management ----
export const managerProductsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    return request(`/products/manager/all${query ? `?${query}` : ""}`, { auth: true });
  },
  create: (formData) => request("/products", { method: "POST", body: formData, isForm: true, auth: true }),
  update: (id, formData) =>
    request(`/products/${id}`, { method: "PUT", body: formData, isForm: true, auth: true }),
  remove: (id) => request(`/products/${id}`, { method: "DELETE", auth: true }),
};

export const managerApi = {
  dashboard: () => request("/manager/dashboard", { auth: true }),
};

export { ApiError };
