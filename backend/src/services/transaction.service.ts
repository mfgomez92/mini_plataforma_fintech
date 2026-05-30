import { EstadoTransaccion, Transaction } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { NotFoundError, BusinessError, ValidationError } from '../errors/AppError';
import { TRANSACTION_EVENTS } from '../lib/events';
import { EventEmitter } from 'events';
import prisma from '../lib/prisma';

export class TransactionService {
  constructor(
    private userRepo: UserRepository,
    private transactionRepo: TransactionRepository,
    private eventEmitter: EventEmitter
  ) {}

  async createTransaction(origenId: string, destinoId: string, monto: number): Promise<Transaction> {
    if (monto <= 0) {
      throw new ValidationError("El monto debe ser mayor a cero");
    }
    if (origenId === destinoId) {
      throw new ValidationError("El usuario origen y destino no pueden ser el mismo");
    }

    const transaction = await prisma.$transaction(async (tx) => {
      // Obtener y bloquear ambos registros a nivel de base de datos a través del repositorio
      const users = await this.userRepo.findUsersForUpdate([origenId, destinoId], tx);

      const origenUser = users.find(u => u.id === origenId);
      const destinoUser = users.find(u => u.id === destinoId);

      // 1. Verifica que ambos usuarios existan
      if (!origenUser) {
        throw new NotFoundError("Usuario origen no encontrado");
      }
      if (!destinoUser) {
        throw new NotFoundError("Usuario destino no encontrado");
      }

      // 2. Verifica que el usuario origen tenga saldo suficiente
      if (Number(origenUser.saldo) < monto) {
        throw new BusinessError("Saldo insuficiente");
      }

      // 3. Reglas de negocio basadas en el monto
      if (monto > 50000) {
        // Si el monto es mayor a 50.000: PENDIENTE y no modifica saldos
        return await this.transactionRepo.create({
          origenId,
          destinoId,
          monto,
          estado: EstadoTransaccion.PENDIENTE
        }, tx);
      } else {
        // Si el monto es menor o igual a 50.000: Descuenta origen, suma destino y CONFIRMADA
        await this.userRepo.updateSaldo(origenId, monto, 'decrement', tx);
        await this.userRepo.updateSaldo(destinoId, monto, 'increment', tx);

        return await this.transactionRepo.create({
          origenId,
          destinoId,
          monto,
          estado: EstadoTransaccion.CONFIRMADA
        }, tx);
      }
    });

    // Emitir evento de negocio de creación
    this.eventEmitter.emit(TRANSACTION_EVENTS.CREATED, { id: transaction.id, estado: transaction.estado });

    return transaction;
  }

  async getTransactionsByUser(
    userId?: string,
    page: number = 1,
    limit: number = 10,
    estado?: EstadoTransaccion
  ): Promise<{ transactions: Transaction[]; total: number }> {
    if (!userId) {
      return await this.transactionRepo.findAll(page, limit, estado);
    }
    return await this.transactionRepo.findByUserId(userId, page, limit, estado);
  }

  async approveTransaction(transactionId: string): Promise<Transaction> {
    const result = await prisma.$transaction(async (tx) => {
      // Bloquear la fila de la transacción
      const transaction = await this.transactionRepo.findForUpdate(transactionId, tx);

      if (!transaction) {
        throw new NotFoundError("Transacción no encontrada");
      }

      if (transaction.estado !== EstadoTransaccion.PENDIENTE) {
        throw new BusinessError("La transacción no está PENDIENTE");
      }

      const { origenId, destinoId, monto } = transaction;

      // Aplicar el bloqueo concurrente sobre los usuarios
      const users = await this.userRepo.findUsersForUpdate([origenId, destinoId], tx);

      const origenUser = users.find(u => u.id === origenId);
      const destinoUser = users.find(u => u.id === destinoId);

      if (!origenUser || !destinoUser) {
        throw new NotFoundError("Usuarios de la transacción no encontrados");
      }

      if (Number(origenUser.saldo) < Number(monto)) {
        throw new BusinessError("Saldo insuficiente en origen para aprobar la transacción");
      }

      // Descontar saldo y aumentar saldo destino
      await this.userRepo.updateSaldo(origenId, Number(monto), 'decrement', tx);
      await this.userRepo.updateSaldo(destinoId, Number(monto), 'increment', tx);

      // Confirmar transacción
      return await this.transactionRepo.updateEstado(transactionId, EstadoTransaccion.CONFIRMADA, undefined, tx);
    });

    // Emitir evento de negocio de actualización
    this.eventEmitter.emit(TRANSACTION_EVENTS.UPDATED, { id: transactionId, estado: EstadoTransaccion.CONFIRMADA });

    return result;
  }

  async rejectTransaction(transactionId: string, motivo?: string): Promise<Transaction> {
    const result = await prisma.$transaction(async (tx) => {
      // Bloquear la fila de la transacción para evitar race conditions
      const transaction = await this.transactionRepo.findForUpdate(transactionId, tx);

      if (!transaction) {
        throw new NotFoundError("Transacción no encontrada");
      }

      if (transaction.estado !== EstadoTransaccion.PENDIENTE) {
        throw new BusinessError("La transacción no está PENDIENTE");
      }

      // Actualizar estado a RECHAZADA
      return await this.transactionRepo.updateEstado(transactionId, EstadoTransaccion.RECHAZADA, motivo, tx);
    });

    // Emitir evento de negocio de actualización
    this.eventEmitter.emit(TRANSACTION_EVENTS.UPDATED, { id: transactionId, estado: EstadoTransaccion.RECHAZADA });

    return result;
  }
}
