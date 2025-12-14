import { useState, useEffect } from 'react';
import { Check, X, Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Um número', test: (p) => /[0-9]/.test(p) },
  { label: 'Um caractere especial (!@#$%...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(p) },
  { label: 'Sem espaços', test: (p) => !/\s/.test(p) || p.length === 0 },
];

export function PasswordStrengthMeter({ password, onValidationChange, className }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [strengthColor, setStrengthColor] = useState('bg-gray-200');
  const [metRequirements, setMetRequirements] = useState<boolean[]>([]);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthLabel('');
      setStrengthColor('bg-gray-200');
      setMetRequirements(requirements.map(() => false));
      onValidationChange?.(false, ['Senha é obrigatória']);
      return;
    }

    // Calcular quais requisitos foram atendidos
    const met = requirements.map((req) => req.test(password));
    setMetRequirements(met);

    // Calcular pontuação
    const metCount = met.filter(Boolean).length;
    let score = 0;
    
    // Pontos por comprimento
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    
    // Pontos por requisitos atendidos
    score += metCount * 12;

    // Garantir que score está entre 0-100
    score = Math.min(100, Math.max(0, score));
    setStrength(score);

    // Determinar label e cor
    if (score >= 80) {
      setStrengthLabel('Muito forte');
      setStrengthColor('bg-green-500');
    } else if (score >= 60) {
      setStrengthLabel('Forte');
      setStrengthColor('bg-blue-500');
    } else if (score >= 40) {
      setStrengthLabel('Média');
      setStrengthColor('bg-yellow-500');
    } else if (score >= 20) {
      setStrengthLabel('Fraca');
      setStrengthColor('bg-orange-500');
    } else {
      setStrengthLabel('Muito fraca');
      setStrengthColor('bg-red-500');
    }

    // Gerar erros
    const errors = requirements
      .filter((_, i) => !met[i])
      .map((req) => req.label);

    const isValid = errors.length === 0;
    onValidationChange?.(isValid, errors);
  }, [password, onValidationChange]);

  const getIcon = () => {
    if (strength >= 80) return <ShieldCheck className="h-5 w-5 text-green-500" />;
    if (strength >= 60) return <Shield className="h-5 w-5 text-blue-500" />;
    if (strength >= 40) return <Shield className="h-5 w-5 text-yellow-500" />;
    if (strength >= 20) return <ShieldAlert className="h-5 w-5 text-orange-500" />;
    return <ShieldX className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Barra de força */}
      {password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getIcon()}
              <span className="font-medium">{strengthLabel}</span>
            </div>
            <span className="text-muted-foreground">{strength}%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', strengthColor)}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de requisitos */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {requirements.map((req, index) => (
          <div
            key={req.label}
            className={cn(
              'flex items-center gap-2 transition-colors',
              metRequirements[index] ? 'text-green-600' : 'text-muted-foreground'
            )}
          >
            {metRequirements[index] ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
