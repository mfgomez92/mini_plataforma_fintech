import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="p-8 flex justify-center items-center" data-testid="loading-spinner">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-belo-green"></div>
    </div>
  );
};
