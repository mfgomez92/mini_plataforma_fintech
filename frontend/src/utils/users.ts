export interface TestUser {
  id: string;
  nombre: string;
}

export const TEST_USERS: TestUser[] = [
  { id: 'a0000000-0000-0000-0000-000000000001', nombre: 'Alice Smith' },
  { id: 'b0000000-0000-0000-0000-000000000002', nombre: 'Bob Johnson' },
  { id: 'c0000000-0000-0000-0000-000000000003', nombre: 'Charlie Brown' }
];

export const getUserName = (id: string, users?: { id: string; nombre: string }[]): string => {
  const source = users || TEST_USERS;
  const user = source.find(u => u.id === id);
  return user ? user.nombre : id;
};
