import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../services/users';
import type { User } from '../types';

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutos de caché
  });
};
