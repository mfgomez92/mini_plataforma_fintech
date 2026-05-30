import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useApproveTransaction, useRejectTransaction } from '../hooks/useTransactionActions';
import { useUsers } from '../hooks/useUsers';
import { formatCurrency, formatDate } from '../utils/format';
import { getUserName } from '../utils/users';
import type { Transaction } from '../types';
import { Button, Card, LoadingSpinner, ErrorMessage } from '../components/ui';
import { DESIGN_VARIANCE, MOTION_INTENSITY } from '../utils/theme';

export const ApproveTransaction: React.FC = () => {
  // Solicitamos estado PENDIENTE al backend para optimización en servidor
  const { data: usersData = [] } = useUsers();
  const { data, isLoading, isError } = useTransactions(undefined, 1, 50, 'PENDIENTE');
  const transactions = data?.transactions;
  const { mutate: approve, isPending: isApproving } = useApproveTransaction();
  const { mutate: reject, isPending: isRejecting } = useRejectTransaction();

  const [transactionToReject, setTransactionToReject] = useState<Transaction | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Doble protección del lado del cliente (defensive programming)
  const pendingTransactions = useMemo(() => {
    return transactions?.filter(tx => tx.estado === 'PENDIENTE') || [];
  }, [transactions]);

  const handleApprove = useCallback((id: string) => {
    approve(id);
  }, [approve]);

  const handleOpenRejectModal = useCallback((tx: Transaction) => {
    setTransactionToReject(tx);
    setRejectReason('');
  }, []);

  const handleCloseRejectModal = useCallback(() => {
    setTransactionToReject(null);
    setRejectReason('');
  }, []);

  const handleConfirmReject = useCallback(() => {
    if (transactionToReject) {
      reject(
        { id: transactionToReject.id, motivo: rejectReason },
        {
          onSuccess: () => {
            handleCloseRejectModal();
          }
        }
      );
    }
  }, [transactionToReject, rejectReason, reject, handleCloseRejectModal]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseRejectModal();
      }
    };
    if (transactionToReject) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [transactionToReject, handleCloseRejectModal]);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      <h1 className="text-3xl font-bold text-belo-light-text mb-6">Aprobación de Transacciones</h1>

      <div className="min-w-0">
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <ErrorMessage message="Hubo un error al cargar las transacciones. Por favor, intenta nuevamente." />
        ) : pendingTransactions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-belo-dark-border bg-belo-dark-surface">
            <p className="text-lg font-medium text-belo-light-text mb-1">
              No hay transacciones pendientes.
            </p>
            <p className="text-sm text-belo-light-muted">
              No hay transacciones pendientes de revisión en este momento.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {pendingTransactions.map((tx) => (
              <Card 
                key={tx.id} 
                className={`flex flex-col gap-4 ${DESIGN_VARIANCE.glow.pendiente} ${MOTION_INTENSITY.hover} border border-white/[0.04]`}
              >
                {/* Fila superior */}
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-belo-semantic-warning flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-belo-semantic-warning animate-ping"></span>
                    Transferencia pendiente
                  </span>
                  <span className="text-belo-light-muted">
                    {formatDate(tx.fecha)}
                  </span>
                </div>

                {/* Fila central */}
                <div className="text-3xl font-extrabold text-belo-light-text">
                  {formatCurrency(tx.monto)}
                </div>

                {/* Fila descriptiva */}
                <div className="text-sm text-belo-light-muted flex flex-col gap-0.5">
                  <div>
                    De: <span className="font-semibold text-belo-light-text">{getUserName(tx.origenId, usersData)}</span> &rarr; Para: <span className="font-semibold text-belo-light-text">{getUserName(tx.destinoId, usersData)}</span>
                  </div>
                  {(tx.origenId !== getUserName(tx.origenId, usersData) || tx.destinoId !== getUserName(tx.destinoId, usersData)) && (
                    <div className="text-xs text-belo-light-muted font-mono opacity-80 mt-1">
                      ID Origen: {tx.origenId} <br />
                      ID Destino: {tx.destinoId}
                    </div>
                  )}
                </div>

                {/* Fila inferior (Acciones) */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(tx.id)}
                    disabled={isApproving || isRejecting}
                    variant="primary"
                    className="flex-1"
                  >
                    Aprobar
                  </Button>
                  <Button
                    onClick={() => handleOpenRejectModal(tx)}
                    disabled={isApproving || isRejecting}
                    variant="secondary"
                    className="flex-1 text-belo-semantic-error border-belo-semantic-error/40 hover:bg-belo-semantic-error/10 hover:border-belo-semantic-error hover:text-white"
                  >
                    Rechazar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {transactionToReject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-belo-dark-base/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Card className={`max-w-md w-full !p-6 border border-belo-dark-border bg-belo-dark-surface shadow-2xl relative ${MOTION_INTENSITY.animateIn}`}>
            {/* Glow superior de alerta estilo fintech */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-belo-semantic-error"></div>
            
            <h3 id="modal-title" className="text-xl font-bold text-belo-light-text mb-4 mt-2">
              ¿Estás seguro de rechazar este envío?
            </h3>
            <p id="modal-description" className="text-belo-light-muted mb-4 text-sm">
              Estás a punto de rechazar la transacción por <span className="font-semibold text-belo-light-text">{formatCurrency(transactionToReject.monto)}</span> de {getUserName(transactionToReject.origenId, usersData)} a {getUserName(transactionToReject.destinoId, usersData)}.
            </p>
            
            <div className="mb-6">
              <label htmlFor="motivo" className="block text-sm font-medium text-belo-light-muted mb-1.5">
                ¿Por qué rechazas esta operación? (opcional)
              </label>
              <input
                type="text"
                id="motivo"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: Fondos insuficientes, sospecha de fraude..."
                className={`w-full px-4 py-2 bg-transparent border border-belo-dark-border ${DESIGN_VARIANCE.borderRadius.input} text-belo-light-text focus:outline-none focus:ring-2 focus:ring-belo-semantic-error focus:border-belo-semantic-error ${MOTION_INTENSITY.transition}`}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCloseRejectModal}
                disabled={isRejecting}
                variant="secondary"
                className="px-4 py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmReject}
                disabled={isRejecting}
                isLoading={isRejecting}
                className="bg-belo-semantic-error hover:bg-red-700 text-white font-medium rounded-full px-6 border-transparent"
              >
                Confirmar Rechazo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApproveTransaction;
