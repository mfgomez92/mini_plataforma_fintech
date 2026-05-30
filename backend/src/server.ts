import app from './app';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import logger from './lib/logger';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server ready at: http://localhost:${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  logger.warn(`${signal} recibido. Cerrando conexión con la base de datos...`);
  await prisma.$disconnect();
  server.close(() => {
    logger.warn('Servidor detenido.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
