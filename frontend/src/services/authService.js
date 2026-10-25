const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "The request failed.");
  }

  return data;
}

export async function login({ username, password, rememberMe }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
      rememberMe
    })
  });
}

export async function getCurrentUser() {
  return request("/auth/me");
}

export async function logout() {
  return request("/auth/logout", {
    method: "POST",
    body: JSON.stringify({})
  });
}

export async function requestPasswordReset(email) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function resetPassword({ token, password }) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password })
  });
}