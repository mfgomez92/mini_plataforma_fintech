import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { addClient, removeClient } from '../lib/sse';
import { UserRepository } from '../repositories/user.repository';
import logger from '../lib/logger';

export class SystemController {
  constructor(private prisma: PrismaClient) {}

  healthcheck = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ 
        status: 'OK', 
        message: 'Fintech API is running',
        database: 'Connected' 
      });
    } catch (error) {
      logger.error(error, 'Healthcheck DB Error');
      res.status(500).json({ 
        status: 'ERROR', 
        message: 'Database connection failed' 
      });
    }
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRepo = new UserRepository(this.prisma);
      const users = await userRepo.findAll();
      res.status(200).json({
        status: 'SUCCESS',
        data: users
      });
    } catch (error) {
      logger.error(error, 'Error al obtener usuarios');
      res.status(500).json({
        status: 'ERROR',
        message: 'No se pudo obtener la lista de usuarios'
      });
    }
  };

  events = (req: Request, res: Response): void => {
    addClient(res);
    res.write(': ping\n\n');

    req.on('close', () => {
      removeClient(res);
    });
  };
}
