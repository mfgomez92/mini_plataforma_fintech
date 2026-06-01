import api from './api';
import type { Transaction } from '../types';

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiTransaction {
  id: string;
  origenId: string;
  destinoId: string;
  monto: string | number;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';
  motivoRechazo?: string;
  fecha: string;
}

const mapTransaction = (tx: ApiTransaction): Transaction => ({
  id: tx.id,
  origenId: tx.origenId,
  destinoId: tx.destinoId,
  monto: Number(tx.monto),
  estado: tx.estado,
  motivoRechazo: tx.motivoRechazo,
  fecha: tx.fecha
});

export const getTransactions = async (
  userId?: string,
  page: number = 1,
  limit: number = 10,
  estado?: string
): Promise<PaginatedTransactions> => {
  const response = await api.get('/transactions', {
    params: {
      ...(userId && { userId }),
      ...(estado && { estado }),
      page,
      limit,
    },
  });
  return {
    transactions: response.data.data.transactions.map(mapTransaction),
    pagination: response.data.data.pagination
  };
};

export const createTransaction = async (data: { origenId: string; destinoId: string; monto: number }): Promise<Transaction> => {
  const response = await api.post('/transactions', data);
  return mapTransaction(response.data.data);
};

export const approveTransaction = async (id: string): Promise<Transaction> => {
  const response = await api.patch(`/transactions/${id}/approve`);
  return mapTransaction(response.data.data);
};

export const rejectTransaction = async ({ id, motivo }: { id: string; motivo?: string }): Promise<Transaction> => {
  const response = await api.patch(`/transactions/${id}/reject`, { motivo });
  return mapTransaction(response.data.data);
};

