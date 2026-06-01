import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTransaction } from '../hooks/useCreateTransaction';
import { useUsers } from '../hooks/useUsers';
import { Button, Card, LoadingSpinner } from '../components/ui';
import { UserSelector } from '../components/UserSelector';
import { Check, AlertCircle } from 'lucide-react';
import { DESIGN_VARIANCE, MOTION_INTENSITY } from '../utils/theme';

const createTransactionSchema = z
  .object({
    origenId: z.string().min(1, 'Debes seleccionar un usuario de origen'),
    destinoId: z.string().min(1, 'Debes seleccionar un usuario de destino'),
    monto: z.number({ error: 'El monto debe ser un número' }).positive('El monto debe ser mayor a 0'),
  })
  .refine((data) => data.origenId !== data.destinoId, {
    message: 'El origen y destino no pueden ser el mismo usuario',
    path: ['destinoId'],
  });

type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;

export const CreateTransaction = () => {
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const { mutate, isPending, isError, error, isSuccess, reset: resetMutation } = useCreateTransaction();

  const {
    control,
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { origenId: '', destinoId: '', monto: 0 },
  });

  const onSubmit = (data: CreateTransactionFormValues) => {
    mutate(
      { origenId: data.origenId, destinoId: data.destinoId, monto: data.monto },
      {
        onSuccess: () => {
          resetForm();
          setTimeout(() => resetMutation(), 5000);
        },
      },
    );
  };

  const errorMessage = isError
    ? error?.response?.data?.message || error?.message || 'Ocurrió un error al procesar la transacción.'
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Usuario Origen */}
            <div>
              <Controller
                name="origenId"
                control={control}
                render={({ field }) => (
                  <UserSelector
                    id="origen-select"
                    label="¿Desde qué cuenta envías?"
                    value={field.value}
                    onChange={field.onChange}
                    placeholderSelect="-- Seleccionar usuario origen --"
                    users={users}
                  />
                )}
              />
              {errors.origenId && (
                <p className="mt-1.5 text-sm text-belo-semantic-error">{errors.origenId.message}</p>
              )}
            </div>

            {/* Usuario Destino */}
            <div>
              <Controller
                name="destinoId"
                control={control}
                render={({ field }) => (
                  <UserSelector
                    id="destino-select"
                    label="¿A quién le quieres enviar?"
                    value={field.value}
                    onChange={field.onChange}
                    placeholderSelect="-- Seleccionar usuario destino --"
                    users={users}
                  />
                )}
              />
              {errors.destinoId && (
                <p className="mt-1.5 text-sm text-belo-semantic-error">{errors.destinoId.message}</p>
              )}
            </div>

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
                  step="0.01"
                  min="0.01"
                  {...register('monto', { valueAsNumber: true })}
                  className={`w-full pl-8 pr-4 py-2 bg-transparent border ${errors.monto ? 'border-belo-semantic-error focus:ring-belo-semantic-error' : 'border-belo-dark-border focus:ring-belo-green'} ${DESIGN_VARIANCE.borderRadius.input} text-belo-light-text focus:outline-none focus:ring-2 min-h-touch ${MOTION_INTENSITY.transition}`}
                  placeholder="0.00"
                />
              </div>
              {errors.monto && (
                <p className="mt-1.5 text-sm text-belo-semantic-error">{errors.monto.message}</p>
              )}
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
