import React from 'react';
import { DESIGN_VARIANCE, MOTION_INTENSITY } from '../../utils/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = React.memo(({
  variant = 'primary',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses = `min-h-touch ${DESIGN_VARIANCE.borderRadius.button} font-bold flex justify-center items-center px-6 select-none ${MOTION_INTENSITY.transition}`;
  
  const variantClasses = variant === 'primary'
    ? `${DESIGN_VARIANCE.gradients.primary} text-black ${MOTION_INTENSITY.hover} ${MOTION_INTENSITY.active}`
    : `bg-transparent border border-belo-dark-border text-belo-light-text ${MOTION_INTENSITY.hoverSecondary} ${MOTION_INTENSITY.active}`;

  const stateClasses = (isLoading || disabled) ? 'opacity-50 pointer-events-none' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses} ${stateClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className={`${MOTION_INTENSITY.spinner} h-5 w-5`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          data-testid="loading-spinner"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

