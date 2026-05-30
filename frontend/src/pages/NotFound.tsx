import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import { Button, Card } from '../components/ui';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <Card className="max-w-md w-full flex flex-col items-center border border-white/[0.04] !p-8 md:!p-12 relative overflow-hidden">
        {/* Glow de acento superior estilo fintech */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-belo-semantic-error"></div>
        
        <div className="w-16 h-16 bg-belo-semantic-error/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-belo-semantic-error" />
        </div>
        
        <h1 className="text-5xl font-extrabold text-belo-light-text mb-2">404</h1>
        <h2 className="text-xl font-bold text-belo-light-text mb-4">Página no encontrada</h2>
        <p className="text-belo-light-muted mb-8 text-sm leading-relaxed">
          Lo sentimos, el recurso que estás buscando no existe o se ha movido a otra dirección.
        </p>

        <Button
          onClick={() => navigate('/')}
          variant="primary"
          className="w-full py-3 flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Volver al Dashboard
        </Button>
      </Card>
    </div>
  );
};

export default NotFound;
