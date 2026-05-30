import { Prisma, EstadoTransaccion, Transaction } from '@prisma/client';
import { CreateTransactionDTO } from '../types';

export class TransactionRepository {
  constructor(private prisma: Prisma.TransactionClient) {}

  /**
   * Crea una nueva transacción.
   */
  async create(
    data: CreateTransactionDTO,
    tx: Prisma.TransactionClient = this.prisma
  ): Promise<Transaction> {
    return await tx.transaction.create({
      data
    });
  }

  /**
   * Bloquea una fila de transacción específica para evitar procesamiento concurrente.
   */
  async findForUpdate(id: string, tx: Prisma.TransactionClient = this.prisma): Promise<Transaction | null> {
    const results: Transaction[] = await tx.$queryRaw`
      SELECT * FROM "Transaction"
      WHERE id = ${id}::uuid
      FOR UPDATE
    `;
    return results[0] || null;
  }

  /**
   * Actualiza el estado de una transacción y opcionalmente el motivo de rechazo.
   */
  async updateEstado(
    id: string,
    estado: EstadoTransaccion,
    motivoRechazo?: string,
    tx: Prisma.TransactionClient = this.prisma
  ): Promise<Transaction> {
    return await tx.transaction.update({
      where: { id },
      data: {
        estado,
        ...(motivoRechazo !== undefined && { motivoRechazo })
      }
    });
  }

  /**
   * Obtiene todas las transacciones ordenadas por fecha con paginación, con filtro opcional de estado.
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    estado?: EstadoTransaccion
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const skip = (page - 1) * limit;
    const take = limit;
    const where = estado ? { estado } : undefined;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: {
          fecha: 'desc'
        }
      }),
      this.prisma.transaction.count({ where })
    ]);

    return { transactions, total };
  }

  /**
   * Obtiene las transacciones donde el usuario es origen o destino, ordenadas por fecha con paginación, con filtro opcional de estado.
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
    estado?: EstadoTransaccion
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const skip = (page - 1) * limit;
    const take = limit;
    const where = {
      OR: [
        { origenId: userId },
        { destinoId: userId }
      ],
      ...(estado && { estado })
    };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: {
          fecha: 'desc'
        }
      }),
      this.prisma.transaction.count({
        where
      })
    ]);

    return { transactions, total };
  }
}
