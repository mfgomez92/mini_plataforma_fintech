export type TransactionStatus = 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';

export interface Transaction {
  id: string;
  origenId: string;
  destinoId: string;
  monto: number;
  estado: TransactionStatus;
  motivoRechazo?: string;
  fecha: string;
}

export interface ApiError {
  status: string;
  message: string;
}
