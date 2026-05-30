import { Router } from 'express';
import { SystemController } from '../controllers/system.controller';

export function createSystemRouter(systemController: SystemController): Router {
  const router = Router();
  router.get('/health', systemController.healthcheck);
  router.get('/api/events', systemController.events);
  router.get('/api/users', systemController.getUsers);
  return router;
}
