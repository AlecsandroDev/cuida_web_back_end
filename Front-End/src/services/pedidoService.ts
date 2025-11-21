import api from './api';

export interface PedidoPayload {
  id_cliente: number;
  id_medicamento: number;
  id_unidade: number;
  id_funcionario: number;
  quantidade: number;
  data_entrega: string;
  horario_entrega: string;
}

export const criarPedido = async (dados: PedidoPayload) => {
  // A URL deve bater com o que definimos no app.js (/api/pedidos)
  const response = await api.post('/pedidos', dados);
  return response.data;
};

export const listarMeusPedidos = async (idCliente: number) => {
  const response = await api.get(`/pedidos/cliente/${idCliente}`);
  return response.data;
};