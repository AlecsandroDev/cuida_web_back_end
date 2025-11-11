import React, { createContext, useContext, useState, useEffect } from 'react';
import { get_profile } from '../services/perfil'; // Sua API de perfil


interface UserProfile {
  nome: string;
  foto_url: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
}

const UserContext = createContext<AuthContextType>({ user: null });

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const id_cliente = localStorage.getItem("id");

  useEffect(() => {
    async function loadUserData() {
      try {
          const profileData = await get_profile(id_cliente);

          if (profileData) {
            const cacheBustedUrl = profileData.foto_url
              ? `${profileData.foto_url}?t=${new Date().getTime()}`
              : null;
            
            setUser({
              nome: profileData.nome_completo,
              foto_url: cacheBustedUrl,
            });
          }
      } catch (e) {
        console.error("Erro ao carregar dados do usuário no Context:", e);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  if (loading) {
    return <div>Carregando portal...</div>;
  }

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
};