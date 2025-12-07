import React from 'react';
import { Check, X } from 'lucide-react';

interface CheckboxRowProps {
  label: string;
  value: number;
  checked: boolean;
  onChange: () => void;
  isNegative?: boolean; // If true, display value in red (discount)
}

export const CheckboxRow: React.FC<CheckboxRowProps> = ({ 
  label, 
  value, 
  checked, 
  onChange,
  isNegative = true 
}) => {
  // Use absolute value to prevent double negatives if the input value is already negative
  const displayValue = Math.abs(value).toLocaleString();
  const isZero = value === 0;

  return (
    <div 
      onClick={!isZero ? onChange : undefined}
      className={`
        flex items-center justify-between py-3 border-b border-dashed border-milk-dark/30
        transition-all duration-200 
        ${isZero ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
          ${checked && !isZero ? 'bg-milk-accent border-milk-accent' : 'bg-white border-milk-dark/50'}
        `}>
          {checked && !isZero && <Check size={16} className="text-white" />}
          {isZero && <X size={16} className="text-gray-300" />}
        </div>
        <span className="text-gray-700 font-medium text-sm sm:text-base">{label}</span>
      </div>
      
      <span className={`font-rounded text-lg font-bold ${isNegative ? 'text-soft-red' : 'text-milk-dark'}`}>
        {isNegative && !isZero ? '-' : ''}{displayValue}
      </span>
    </div>
  );
};