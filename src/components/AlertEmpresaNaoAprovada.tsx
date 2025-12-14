import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertEmpresaNaoAprovadaProps {
  className?: string;
  variant?: "default" | "warning";
  showIcon?: boolean;
  title?: string;
  message?: string;
}

/**
 * Componente para exibir alerta quando empresa não está aprovada
 * Bloqueia funcionalidades que requerem aprovação prévia
 */
export const AlertEmpresaNaoAprovada = ({
  className = "",
  variant = "warning",
  showIcon = true,
  title = "Empresa Aguardando Aprovação",
  message = "Esta funcionalidade estará disponível após a aprovação da sua empresa por um administrador. Você será notificado por e-mail quando a aprovação for concluída."
}: AlertEmpresaNaoAprovadaProps) => {
  return (
    <Alert 
      className={`border-amber-500 bg-amber-50 ${className}`}
      variant={variant === "warning" ? "default" : "default"}
    >
      {showIcon && (
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          <AlertCircle className="h-4 w-4 text-amber-600" />
        </div>
      )}
      <AlertTitle className="text-amber-900 font-semibold">
        {title}
      </AlertTitle>
      <AlertDescription className="text-amber-800">
        {message}
      </AlertDescription>
    </Alert>
  );
};
