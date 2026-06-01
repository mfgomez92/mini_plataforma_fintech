
export const getUserName = (id: string, users: { id: string; nombre: string }[]): string => {
  const user = users.find(u => u.id === id);
  return user ? user.nombre : id;
};
