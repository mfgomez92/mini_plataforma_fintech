import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveTransaction, rejectTransaction } from '../services/transactions';
import type { Transaction, ApiError } from '../types';
import { AxiosError } from 'axios';

export const useApproveTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, AxiosError<ApiError>, string>({
    mutationFn: (id: string) => approveTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useRejectTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, AxiosError<ApiError>, { id: string; motivo?: string }>({
    mutationFn: (data) => rejectTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
