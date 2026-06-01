import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../services/transactions';

export const useTransactions = (
  userId?: string,
  page: number = 1,
  limit: number = 10,
  estado?: string,
) => {
  return useQuery({
    queryKey: ['transactions', userId, page, limit, estado],
    queryFn: () => getTransactions(userId, page, limit, estado),
  });
};
