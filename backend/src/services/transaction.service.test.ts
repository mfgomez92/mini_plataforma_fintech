import { TransactionService } from './transaction.service';
import { UserRepository } from '../repositories/user.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { EventEmitter } from 'events';
import { EstadoTransaccion } from '@prisma/client';
import prisma from '../lib/prisma';
import { NotFoundError, BusinessError, ValidationError } from '../errors/AppError';

// Mocking the prisma singleton module
jest.mock('../lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      $transaction: jest.fn(),
      $queryRaw: jest.fn(),
      transaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn()
      },
      user: {
        update: jest.fn(),
      }
    }
  };
});

describe('TransactionService', () => {
  let userRepo: UserRepository;
  let transactionRepo: TransactionRepository;
  let eventEmitter: EventEmitter;
  let service: TransactionService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock $transaction to simply execute the callback passing the mocked prisma as 'tx'
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
      return await callback(prisma);
    });

    userRepo = new UserRepository(prisma);
    transactionRepo = new TransactionRepository(prisma);
    eventEmitter = new EventEmitter();
    service = new TransactionService(userRepo, transactionRepo, eventEmitter);
  });

  describe('createTransaction', () => {
    const origenId = 'user-1';
    const destinoId = 'user-2';

    it('debe lanzar ValidationError si el monto es <= 0', async () => {
      await expect(service.createTransaction(origenId, destinoId, 0))
        .rejects
        .toThrow(ValidationError);

      await expect(service.createTransaction(origenId, destinoId, -100))
        .rejects
        .toThrow("El monto debe ser mayor a cero");
    });

    it('debe lanzar ValidationError si origen y destino son el mismo', async () => {
      await expect(service.createTransaction(origenId, origenId, 100))
        .rejects
        .toThrow(ValidationError);

      await expect(service.createTransaction(origenId, origenId, 100))
        .rejects
        .toThrow("El usuario origen y destino no pueden ser el mismo");
    });

    it('debe lanzar NotFoundError si el usuario origen no existe', async () => {
      // Mock de queryRaw para retornar sólo el usuario destino
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { id: destinoId, saldo: '500' }
      ]);

      await expect(service.createTransaction(origenId, destinoId, 150))
        .rejects
        .toThrow(NotFoundError);

      await expect(service.createTransaction(origenId, destinoId, 150))
        .rejects
        .toThrow("Usuario origen no encontrado");
    });

    it('debe lanzar NotFoundError si el usuario destino no existe', async () => {
      // Mock de queryRaw para retornar sólo el usuario origen
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { id: origenId, saldo: '500' }
      ]);

      await expect(service.createTransaction(origenId, destinoId, 150))
        .rejects
        .toThrow("Usuario destino no encontrado");
    });

    it('debe lanzar BusinessError por saldo insuficiente', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { id: origenId, saldo: '100' }, 
        { id: destinoId, saldo: '500' }
      ]);

      await expect(service.createTransaction(origenId, destinoId, 150))
        .rejects
        .toThrow(BusinessError);

      expect(prisma.transaction.create).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('se crea CONFIRMADA si el monto es <= 50.000', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { id: origenId, saldo: '60000' }, 
        { id: destinoId, saldo: '500' }
      ]);

      const expectedTx = { id: 'tx-1', origenId, destinoId, monto: 10000, estado: EstadoTransaccion.CONFIRMADA };
      (prisma.transaction.create as jest.Mock).mockResolvedValue(expectedTx);

      const result = await service.createTransaction(origenId, destinoId, 10000);

      expect(result).toEqual(expectedTx);
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: { origenId, destinoId, monto: 10000, estado: EstadoTransaccion.CONFIRMADA }
      });
      expect(prisma.user.update).toHaveBeenCalledTimes(2);
    });

    it('se crea CONFIRMADA si el monto es exactamente 50.000 (límite inclusivo)', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { id: origenId, saldo: '60000' }, 
        { id: destinoId, saldo: '500' }
      ]);

      const expectedTx = { id: 'tx-limit', origenId, destinoId, monto: 50000, estado: EstadoTransaccion.CONFIRMADA };
      (prisma.transaction.create as jest.Mock).mockResolvedValue(expectedTx);

      const result = await service.createTransaction(origenId, destinoId, 50000);

      expect(result).toEqual(expectedTx);
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: { origenId, destinoId, monto: 50000, estado: EstadoTransaccion.CONFIRMADA }
      });
      expect(prisma.user.update).toHaveBeenCalledTimes(2);
    });

    it('se crea PENDIENTE si el monto es > 50.000', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { id: origenId, saldo: '100000' }, 
        { id: destinoId, saldo: '500' }
      ]);

      const expectedTx = { id: 'tx-2', origenId, destinoId, monto: 50001, estado: EstadoTransaccion.PENDIENTE };
      (prisma.transaction.create as jest.Mock).mockResolvedValue(expectedTx);

      const result = await service.createTransaction(origenId, destinoId, 50001);

      expect(result).toEqual(expectedTx);
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: { origenId, destinoId, monto: 50001, estado: EstadoTransaccion.PENDIENTE }
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('getTransactionsByUser', () => {
    it('retorna transacciones ordenadas por fecha desc con paginación', async () => {
      const mockTxs = [
        { id: 'tx-1', origenId: 'user-1', destinoId: 'user-2', monto: 100, fecha: new Date() }
      ];
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTxs);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getTransactionsByUser('user-1', 1, 10);

      expect(result).toEqual({ transactions: mockTxs, total: 1 });
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { origenId: 'user-1' },
            { destinoId: 'user-1' }
          ]
        },
        skip: 0,
        take: 10,
        orderBy: {
          fecha: 'desc'
        }
      });
      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { origenId: 'user-1' },
            { destinoId: 'user-1' }
          ]
        }
      });
    });
  });

  describe('approveTransaction', () => {
    const transactionId = 'tx-1';
    const origenId = 'user-1';
    const destinoId = 'user-2';

    it('debe lanzar NotFoundError si la transacción no existe', async () => {
      // Mock de queryRaw para retornar array vacío (transacción no encontrada)
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      await expect(service.approveTransaction(transactionId))
        .rejects
        .toThrow(NotFoundError);
    });

    it('debe lanzar BusinessError si la transacción no está PENDIENTE', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { id: transactionId, origenId, destinoId, monto: 100000, estado: EstadoTransaccion.CONFIRMADA }
      ]);

      await expect(service.approveTransaction(transactionId))
        .rejects
        .toThrow(BusinessError);
    });

    it('debe lanzar NotFoundError si alguno de los usuarios no existe', async () => {
      // Primera queryRaw para la transacción
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { id: transactionId, origenId, destinoId, monto: 100000, estado: EstadoTransaccion.PENDIENTE }
      ]);
      // Segunda queryRaw para los usuarios (retorna vacío)
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      await expect(service.approveTransaction(transactionId))
        .rejects
        .toThrow(NotFoundError);
    });

    it('debe lanzar BusinessError si el usuario origen tiene saldo insuficiente', async () => {
      // Transacción
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { id: transactionId, origenId, destinoId, monto: 100000, estado: EstadoTransaccion.PENDIENTE }
      ]);
      // Usuarios (saldo origen: 50.000 < monto 100.000)
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { id: origenId, saldo: '50000' },
        { id: destinoId, saldo: '0' }
      ]);

      await expect(service.approveTransaction(transactionId))
        .rejects
        .toThrow(BusinessError);
    });

    it('debe aprobar con éxito, descontando saldos y cambiando estado a CONFIRMADA', async () => {
      const txData = { id: transactionId, origenId, destinoId, monto: 100000, estado: EstadoTransaccion.PENDIENTE };
      // Transacción
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([txData]);
      // Usuarios
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { id: origenId, saldo: '150000' },
        { id: destinoId, saldo: '0' }
      ]);

      const expectedTx = { ...txData, estado: EstadoTransaccion.CONFIRMADA };
      (prisma.transaction.update as jest.Mock).mockResolvedValue(expectedTx);

      const result = await service.approveTransaction(transactionId);

      expect(result).toEqual(expectedTx);
      expect(prisma.user.update).toHaveBeenCalledTimes(2);
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: transactionId },
        data: { estado: EstadoTransaccion.CONFIRMADA }
      });
    });
  });

  describe('rejectTransaction', () => {
    const transactionId = 'tx-1';

    it('debe lanzar NotFoundError si la transacción no existe', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      await expect(service.rejectTransaction(transactionId, 'Motivo'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('debe lanzar BusinessError si la transacción no está PENDIENTE', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { id: transactionId, estado: EstadoTransaccion.RECHAZADA }
      ]);

      await expect(service.rejectTransaction(transactionId, 'Motivo'))
        .rejects
        .toThrow(BusinessError);
    });

    it('debe rechazar con éxito, cambiando estado a RECHAZADA con motivoRechazo', async () => {
      const txData = { id: transactionId, estado: EstadoTransaccion.PENDIENTE };
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([txData]);

      const expectedTx = { ...txData, estado: EstadoTransaccion.RECHAZADA, motivoRechazo: 'Motivo de rechazo' };
      (prisma.transaction.update as jest.Mock).mockResolvedValue(expectedTx);

      const result = await service.rejectTransaction(transactionId, 'Motivo de rechazo');

      expect(result).toEqual(expectedTx);
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: transactionId },
        data: { 
          estado: EstadoTransaccion.RECHAZADA,
          motivoRechazo: 'Motivo de rechazo'
        }
      });
    });
  });
});