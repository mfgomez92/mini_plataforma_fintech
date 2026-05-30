import { z } from 'zod';
import { EstadoTransaccion } from '@prisma/client';

export const createTransactionSchema = z.object({
  origenId: z.string(),
  destinoId: z.string(),
  monto: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'El monto debe ser un número mayor a cero' })
  )
}).refine(data => data.origenId !== data.destinoId, {
  message: 'El usuario origen y destino no pueden ser el mismo',
  path: ['destinoId']
});

export const getTransactionsQuerySchema = z.object({
  userId: z.string().optional(),
  estado: z.nativeEnum(EstadoTransaccion, { message: 'Estado de transacción inválido' }).optional(),
  page: z.preprocess(
    (val) => (val ? Number(val) : 1),
    z.number().int().positive({ message: 'La página debe ser un número entero mayor a cero' })
  ).default(1),
  limit: z.preprocess(
    (val) => (val ? Number(val) : 10),
    z.number().int().positive().max(100, { message: 'El límite máximo es 100' })
  ).default(10)
});

export const transactionParamsSchema = z.object({
  id: z.string()
});

export const rejectTransactionSchema = z.object({
  motivo: z.string().min(1, { message: 'El motivo de rechazo no puede estar vacío' }).max(255).optional()
});
