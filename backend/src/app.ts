import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import prisma from './lib/prisma';
import { transactionEventEmitter, TRANSACTION_EVENTS } from './lib/events';
import { broadcastEvent } from './lib/sse';
import { errorHandler } from './middleware/errorHandler';
import logger from './lib/logger';

// Repositorios instanciados
import { UserRepository } from './repositories/user.repository';
import { TransactionRepository } from './repositories/transaction.repository';
// Servicios y controladores instanciados
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';
import { SystemController } from './controllers/system.controller';
// Routers
import { createTransactionRouter } from './routes/transaction.routes';
import { createSystemRouter } from './routes/system.routes';

const app = express();

app.use(helmet());

const allowedOrigins = [
  'http://localhost',
  'http://localhost:5173',
  'http://localhost:80'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS: Origen no permitido'));
    }
  },
  credentials: true
}));

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.' }
});
app.use('/api/', apiLimiter);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Cableado de Inyección de Dependencias
const userRepo = new UserRepository(prisma);
const transactionRepo = new TransactionRepository(prisma);
const transactionService = new TransactionService(userRepo, transactionRepo, transactionEventEmitter);

const transactionController = new TransactionController(transactionService);
const systemController = new SystemController(prisma);

// Conectar Emisor de Eventos de negocio a SSE
transactionEventEmitter.on(TRANSACTION_EVENTS.UPDATED, (data) => {
  broadcastEvent('transaction_updated', data);
});
transactionEventEmitter.on(TRANSACTION_EVENTS.CREATED, (data) => {
  broadcastEvent('transaction_updated', data);
});

// Registrar rutas
app.use('/', createSystemRouter(systemController));
app.use('/api/transactions', createTransactionRouter(transactionController));

app.use(errorHandler);

export default app;
