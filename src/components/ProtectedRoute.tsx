import { Navigate } from "react-router-dom";
import { clearStoredAuth, isStoredTokenExpired } from "@/utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Verificar se há token de autenticação no localStorage
  const authToken = localStorage.getItem("authToken");
  const tokenExpired = isStoredTokenExpired();

  // Se não há token, redirecionar para login
  if (!authToken || tokenExpired) {
    clearStoredAuth();
    return <Navigate to="/login" replace />;
  }

  // Se há token, renderizar o componente
  return <>{children}</>;
};
