import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../services/transactions';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutos de caché
  });
};
