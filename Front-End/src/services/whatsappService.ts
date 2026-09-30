import api from "./api";

export interface EnviarMensagemPayload {
  numero: string;
  mensagem: string;
}

export const enviarMensagemWhatsApp = async (dados: EnviarMensagemPayload) => {
  const response = await api.post("/whatsapp/enviar", dados);
  return response.data;
};