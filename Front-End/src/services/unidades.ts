import api from "./api";

export async function get_unidades() {
  const res = await api.get("/unidades/get-unidades");
  return res.data;
}

export async function get_estoque() {
  const res = await api.get("/estoques/get-estoque");
  return res.data;
}

export async function get_medicamento(id) {
  const res = await api.get(`/medicamentos/get-medicamentos/${id}`);
  return res;
}
