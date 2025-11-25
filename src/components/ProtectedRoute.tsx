import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Verificar se há token de autenticação no localStorage
  const authToken = localStorage.getItem("authToken");

  // Se não há token, redirecionar para login
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  // Se há token, renderizar o componente
  return <>{children}</>;
};
