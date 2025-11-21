import api from './api';

export interface Favorito {
  id_favorito: number;
  id_cliente: number;
  id_unidade: number;
  id_medicamento: number;
  medicamento?: { nome: string; principio_ativo: string };
  unidade?: { nome_unidade: string; endereco: string };
}

export const adicionarFavorito = async (dados: { id_cliente: number; id_unidade: number; id_medicamento: number }) => {
  const response = await api.post('/favoritos', dados);
  return response.data;
};

export const listarFavoritos = async (idCliente: number): Promise<Favorito[]> => {
  const response = await api.get(`/favoritos/cliente/${idCliente}`);
  return response.data;
};

export const removerFavorito = async (idFavorito: number) => {
  await api.delete(`/favoritos/${idFavorito}`);
};