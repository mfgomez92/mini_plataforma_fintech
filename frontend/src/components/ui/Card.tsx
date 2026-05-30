import React from 'react';
import { DESIGN_VARIANCE, MOTION_INTENSITY } from '../../utils/theme';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = React.memo(({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`${DESIGN_VARIANCE.glassmorphism.card} ${DESIGN_VARIANCE.borderRadius.card} p-6 ${MOTION_INTENSITY.transition} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

