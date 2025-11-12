import { useQuery } from "@tanstack/react-query";
import { get_profile } from "../services/perfil";

const fetchProfile = async () => {
  const id_cliente = localStorage.getItem("id");
  if (!id_cliente) {
    throw new Error("ID do cliente não encontrado"); 
  }
  const data = await get_profile(id_cliente);
  if (!data) {
    throw new Error("Falha ao buscar perfil");
  }
  return data;
};

export const useUserProfile = () => {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchProfile,     
    enabled: !!localStorage.getItem("id"),
    staleTime: 1000 * 60 * 10,
  });

  return {
    profile: data,
    isLoadingProfile: isLoading,
    isProfileError: isError,
    error,
  };
};