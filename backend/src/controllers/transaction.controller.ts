import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service';

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { origenId, destinoId, monto } = req.body;
      const transaction = await this.transactionService.createTransaction(origenId, destinoId, monto);
      
      res.status(201).json({ 
        status: 'SUCCESS', 
        data: transaction 
      });
    } catch (error) {
      next(error);
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, estado, page, limit } = req.query as any;
      const result = await this.transactionService.getTransactionsByUser(userId, page, limit, estado);
      
      res.status(200).json({
        status: 'SUCCESS',
        data: {
          transactions: result.transactions,
          pagination: {
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  approveTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const transaction = await this.transactionService.approveTransaction(id);

      res.status(200).json({
        status: 'SUCCESS',
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  };

  rejectTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const transaction = await this.transactionService.rejectTransaction(id, motivo);

      res.status(200).json({
        status: 'SUCCESS',
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  };
}
