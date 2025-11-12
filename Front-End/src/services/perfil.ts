import api from "./api";

export async function get_profile(id) {
  const res = await api.get(`/clientes/perfil/${id}`);
  return res.data;
}

export async function update_profile(id, data) {
  const res = await api.patch(`/clientes/update/${id}`, data);
  return res.data;
}