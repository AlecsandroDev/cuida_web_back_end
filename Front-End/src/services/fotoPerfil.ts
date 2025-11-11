import api from "./api";

export async function uploadPhoto(id, file) {
  const formData = new FormData();
  formData.append("foto", file);

  try {
    const { data } = await api.post(`/clientes/upload-foto/${id}`, formData);

    return data.foto_url;
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    throw error;
  }
};