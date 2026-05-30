import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransaction } from '../services/transactions';
import type { Transaction, ApiError } from '../types';
import { AxiosError } from 'axios';

interface CreateTransactionData {
  origenId: string;
  destinoId: string;
  monto: number;
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, AxiosError<ApiError>, CreateTransactionData>({
    mutationFn: (data) => createTransaction(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
