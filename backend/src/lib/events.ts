import { EventEmitter } from 'events';

export const transactionEventEmitter = new EventEmitter();

// Nombres de eventos tipados
export const TRANSACTION_EVENTS = {
  UPDATED: 'transaction_updated',
  CREATED: 'transaction_created',
};
