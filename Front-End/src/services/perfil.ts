import api from "./api";

export async function get_profile(id) {
  const res = await api.get(`/clientes/perfil/${id}`);
  return res.data;
}