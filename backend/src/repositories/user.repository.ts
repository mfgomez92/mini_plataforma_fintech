import { Prisma, User } from '@prisma/client';

export class UserRepository {
  constructor(private prisma: Prisma.TransactionClient) {}

  /**
   * Bloquea registros de usuarios en la base de datos para transacciones ACID concurrentes.
   * Utiliza ordenamiento por ID para evitar situaciones de Deadlock.
   */
  async findUsersForUpdate(ids: string[], tx: Prisma.TransactionClient = this.prisma): Promise<User[]> {
    if (ids.length === 0) return [];

    return await tx.$queryRaw<User[]>`
      SELECT * FROM "User"
      WHERE id = ANY(${ids}::uuid[])
      ORDER BY id
      FOR UPDATE
    `;
  }

  /**
   * Actualiza el saldo de un usuario de forma atómica.
   */
  async updateSaldo(
    id: string,
    amount: number,
    action: 'increment' | 'decrement',
    tx: Prisma.TransactionClient = this.prisma
  ): Promise<User> {
    return await tx.user.update({
      where: { id },
      data: {
        saldo: {
          [action]: amount
        }
      }
    });
  }

  /**
   * Obtiene todos los usuarios ordenados por nombre.
   */
  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });
  }
}
