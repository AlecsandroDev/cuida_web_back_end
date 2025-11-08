import api from "./api";

export async function register(data) {
  const res = await api.post("/clientes/register", data);
}

export async function login(data) {
  const res = await api.post("/clientes/login", data);
  return res;
}

export function logout() {
  localStorage.removeItem("token");
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
