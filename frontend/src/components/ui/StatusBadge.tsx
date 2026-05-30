import React from 'react';

export interface StatusBadgeProps {
  status: 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';
  className?: string;
}

const statusStyles = {
  CONFIRMADA: 'bg-belo-green/20 text-belo-green border border-belo-green/20 shadow-[0_0_10px_rgba(0,255,178,0.06)]',
  PENDIENTE: 'bg-belo-semantic-warning/20 text-belo-semantic-warning border border-belo-semantic-warning/20 shadow-[0_0_10px_rgba(255,178,0,0.06)]',
  RECHAZADA: 'bg-belo-semantic-error/20 text-belo-semantic-error border border-belo-semantic-error/20 shadow-[0_0_10px_rgba(255,59,48,0.04)]',
};

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({
  status,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold select-none border ${statusStyles[status]} ${className}`}
    >
      {status}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

