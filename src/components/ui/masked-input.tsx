import React from 'react';
import { Input } from './input';

interface MaskedInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  mask: 'phone' | 'cpf' | 'cnpj' | 'cpfCnpj';
  value: string;
  onChange: (value: string) => void;
}

const applyPhoneMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  // Celular com 11 dígitos
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const applyCpfMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, (_, d1, d2, d3, d4) => {
    if (d4) return `${d1}.${d2}.${d3}-${d4}`;
    if (d3) return `${d1}.${d2}.${d3}`;
    if (d2) return `${d1}.${d2}`;
    if (d1) return d1;
    return '';
  });
};

const applyCnpjMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 14);
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, (_, d1, d2, d3, d4, d5) => {
    if (d5) return `${d1}.${d2}.${d3}/${d4}-${d5}`;
    if (d4) return `${d1}.${d2}.${d3}/${d4}`;
    if (d3) return `${d1}.${d2}.${d3}`;
    if (d2) return `${d1}.${d2}`;
    if (d1) return d1;
    return '';
  });
};

const applyCpfCnpjMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return applyCpfMask(value);
  }
  return applyCnpjMask(value);
};

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      let maskedValue = '';

      switch (mask) {
        case 'phone':
          maskedValue = applyPhoneMask(inputValue);
          break;
        case 'cpf':
          maskedValue = applyCpfMask(inputValue);
          break;
        case 'cnpj':
          maskedValue = applyCnpjMask(inputValue);
          break;
        case 'cpfCnpj':
          maskedValue = applyCpfCnpjMask(inputValue);
          break;
        default:
          maskedValue = inputValue;
      }

      onChange(maskedValue);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

