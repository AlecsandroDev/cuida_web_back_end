import api from "./api";

export const salvarFotoPerfil = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("foto", file);

  try {
    const { data } = await api.post(`/clientes/upload-foto/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data.foto_url;
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    throw error;
  }
};

export const loadFotoPerfil = async (id: string) => {
 const data = await api.post(`/clientes/get-foto/${id}`);
 return data;
}
