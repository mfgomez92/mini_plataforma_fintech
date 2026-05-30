import { Response } from 'express';

// Array global de respuestas de clientes conectados a SSE
let clients: Response[] = [];

/**
 * Registra un cliente de SSE configurando las cabeceras adecuadas y forzando el envío inmediato.
 */
export const addClient = (res: Response): void => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  clients.push(res);
};

/**
 * Remueve un cliente de la lista global de SSE.
 */
export const removeClient = (res: Response): void => {
  clients = clients.filter(c => c !== res);
};

/**
 * Transmite un evento en tiempo real a todos los clientes conectados a SSE.
 */
export const broadcastEvent = (event: string, data: any): void => {
  clients.forEach((res) => {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      removeClient(res);
    }
  });
};
