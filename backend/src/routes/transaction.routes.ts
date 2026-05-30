import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { validate } from '../middleware/validate';
import {
  createTransactionSchema,
  getTransactionsQuerySchema,
  transactionParamsSchema,
  rejectTransactionSchema,
} from '../schemas/transaction.schema';

export function createTransactionRouter(controller: TransactionController): Router {
  const router = Router();

  router.post(
    '/',
    validate(createTransactionSchema, 'body'),
    controller.createTransaction
  );

  router.get(
    '/',
    validate(getTransactionsQuerySchema, 'query'),
    controller.getTransactions
  );

  router.patch(
    '/:id/approve',
    validate(transactionParamsSchema, 'params'),
    controller.approveTransaction
  );

  router.patch(
    '/:id/reject',
    validate(transactionParamsSchema, 'params'),
    validate(rejectTransactionSchema, 'body'),
    controller.rejectTransaction
  );

  return router;
}
