import { EstadoTransaccion } from '@prisma/client';

export interface CreateTransactionDTO {
  origenId: string;
  destinoId: string;
  monto: number;
  estado: EstadoTransaccion;
}
