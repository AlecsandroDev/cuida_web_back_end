import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import PortalCidadao from "./pages/PortalCidadao";
import NotFound from "./pages/NotFound";
import LoginCli from "./pages/LoginCli";
import Profile from "./pages/Profile";
import Mapa from "./components/HealthMap";
import CadastroClientes from "./pages/CadastroClientes";
import TermosDeUso from "./pages/TermosDeUso";
import PrivateRoute from "./components/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/clientes/cadastroClientes" element={<CadastroClientes />} />
          <Route path="/clientes/loginClientes" element={<LoginCli />} />
          <Route path="/PortalCidadao" element={<PrivateRoute><PortalCidadao /></PrivateRoute>} />
          <Route path="/mapa" element={ <PrivateRoute><Mapa /></PrivateRoute>} />
          <Route path="/profile" element={ <PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} /> {/* ✅ nova rota */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
