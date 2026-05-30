import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import logger from '../lib/logger';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error({ err }, `[ERROR] ${req.method} ${req.path}: ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'ERROR',
      message: err.message,
    });
    return;
  }

  // Error inesperado — no exponer detalles internos al cliente
  res.status(500).json({
    status: 'ERROR',
    message: 'Error interno del servidor',
  });
}
