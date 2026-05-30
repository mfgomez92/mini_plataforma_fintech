import React from 'react';

interface ErrorMessageProps {
  message?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message = 'Hubo un error al cargar los datos. Por favor, intenta nuevamente.' 
}) => {
  return (
    <div className="p-8 text-center text-belo-semantic-error bg-belo-semantic-error/10 border border-belo-semantic-error/20 rounded-xl" data-testid="error-message">
      {message}
    </div>
  );
};
