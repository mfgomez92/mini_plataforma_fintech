import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCreateTransaction } from '../hooks/useCreateTransaction';
import { useUsers } from '../hooks/useUsers';
import { Button, Card, LoadingSpinner } from '../components/ui';
import { UserSelector } from '../components/UserSelector';
import { Check, AlertCircle } from 'lucide-react';
import { DESIGN_VARIANCE, MOTION_INTENSITY } from '../utils/theme';

export const CreateTransaction: React.FC = () => {
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [isCustomOrigen, setIsCustomOrigen] = useState(false);
  const [isCustomDestino, setIsCustomDestino] = useState(false);
  const [monto, setMonto] = useState<number | ''>('');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const { mutate, isPending, isError, error, isSuccess, reset } = useCreateTransaction();

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!origenId || !destinoId || monto === '') return;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    
    mutate({
      origenId,
      destinoId,
      monto: Number(monto),
    }, {
      onSuccess: () => {
        setOrigenId('');
        setDestinoId('');
        setIsCustomOrigen(false);
        setIsCustomDestino(false);
        setMonto('');
        
        resetTimerRef.current = setTimeout(() => {
          reset();
        }, 5000);
      }
    });
  }, [origenId, destinoId, monto, mutate, reset]);

  const errorMessage = isError 
    ? error?.response?.data?.message || error.message || 'Ocurrió un error al procesar la transacción.'
    : null;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      <h1 className="text-3xl font-bold text-belo-light-text mb-8 text-center bg-gradient-to-r from-white to-belo-light-muted bg-clip-text text-transparent">
        Enviar Dinero
      </h1>

      <Card className="max-w-lg mx-auto !p-8 shadow-2xl relative overflow-hidden border border-white/[0.04]">
        {/* Glow de acento superior estilo fintech */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-belo-purple via-belo-green to-belo-purple"></div>

        {isSuccess && (
          <div className="mb-6 p-4 bg-belo-green/10 text-belo-green border border-belo-green/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-5 h-5 text-belo-green shrink-0" />
            <span className="font-medium">Transacción creada con éxito.</span>
          </div>
        )}

        {isError && (
          <div className="mb-6 p-4 bg-belo-semantic-error/10 text-belo-semantic-error border border-belo-semantic-error/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-5 h-5 text-belo-semantic-error shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {isLoadingUsers ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <UserSelector
              id="origen-select"
              label="¿Desde qué cuenta envías?"
              value={origenId}
              onChange={setOrigenId}
              isCustom={isCustomOrigen}
              setIsCustom={setIsCustomOrigen}
              placeholderSelect="-- Seleccionar usuario origen --"
              placeholderInput="Ej: a0000000-0000-0000-0000-..."
              users={users}
            />

            <UserSelector
              id="destino-select"
              label="¿A quién le quieres enviar?"
              value={destinoId}
              onChange={setDestinoId}
              isCustom={isCustomDestino}
              setIsCustom={setIsCustomDestino}
              placeholderSelect="-- Seleccionar usuario destino --"
              placeholderInput="Ej: b0000000-0000-0000-0000-..."
              users={users}
            />

            {/* Campo Monto */}
            <div>
              <label htmlFor="monto" className="block text-sm font-medium text-belo-light-muted mb-1.5">
                ¿Cuánto vas a transferir?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-belo-light-muted sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="monto"
                  required
                  min="0.01"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value !== '' ? Number(e.target.value) : '')}
                  className={`w-full pl-8 pr-4 py-2 bg-transparent border border-belo-dark-border ${DESIGN_VARIANCE.borderRadius.input} text-belo-light-text focus:outline-none focus:ring-2 focus:ring-belo-green min-h-touch ${MOTION_INTENSITY.transition}`}
                  placeholder="0.00"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isPending}
              className="w-full py-3 mt-4"
            >
              Confirmar Envío
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default CreateTransaction;
