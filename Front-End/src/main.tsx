import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // 1. Importar

// 2. Criar o cliente
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de cache "fresco"
      refetchOnWindowFocus: false, // Opcional: evitar refetch ao trocar de aba
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
