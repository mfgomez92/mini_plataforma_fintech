import React, { useState, useCallback } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useUsers } from '../hooks/useUsers';
import { formatCurrency, formatDate } from '../utils/format';
import { getUserName } from '../utils/users';
import { Button, Card, StatusBadge, LoadingSpinner, ErrorMessage } from '../components/ui';
import { Wallet } from 'lucide-react';
import { DESIGN_VARIANCE, MOTION_INTENSITY } from '../utils/theme';

export const Dashboard: React.FC = () => {
  const [userIdFilter, setUserIdFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 5; // Paginación de 5 en 5 para facilitar visualización en UI

  const { data: usersData = [] } = useUsers();
  const { data, isLoading, isError } = useTransactions(userIdFilter, page, LIMIT);
  const transactions = data?.transactions || [];
  const pagination = data?.pagination;

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setUserIdFilter(searchInput);
    setPage(1); // Restablecer a primera página en nueva búsqueda
  }, [searchInput]);

  const handleSelectUserFilter = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setUserIdFilter(val);
    setSearchInput(val); // Sincroniza la barra de búsqueda también
    setPage(1); // Restablecer a primera página al filtrar
  }, []);

  const handlePrevPage = useCallback(() => {
    setPage(p => Math.max(p - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      <h1 className="text-3xl font-bold text-belo-light-text mb-6">Dashboard de Transacciones</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        {/* Dropdown de selección rápida */}
        <div className="w-full sm:w-64">
          <label htmlFor="user-select" className="block text-xs font-semibold text-belo-light-muted uppercase mb-1">
            Filtrar por Usuario de Prueba
          </label>
          <select
            id="user-select"
            value={userIdFilter}
            onChange={handleSelectUserFilter}
            className={`w-full px-4 py-2 border border-belo-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-belo-green bg-belo-dark-surface text-white ${MOTION_INTENSITY.transition}`}
          >
            <option value="" className="bg-belo-dark-surface">[ Ver todas las transacciones ]</option>
            {usersData.map(user => (
              <option key={user.id} value={user.id} className="bg-belo-dark-surface">
                {user.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Búsqueda manual por ID */}
        <form onSubmit={handleSearch} className="w-full flex-1 flex gap-2 items-end">
          <div className="flex-1">
            <label htmlFor="search-input" className="block text-xs font-semibold text-belo-light-muted uppercase mb-1">
              Buscar UUID manualmente
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="Ej: a0000000-0000-0000-0000-000000000001..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`w-full px-4 py-2 border border-belo-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-belo-green bg-belo-dark-surface text-white ${MOTION_INTENSITY.transition}`}
            />
          </div>
          <Button
            type="submit"
            className="h-[42px]"
          >
            Buscar
          </Button>
        </form>
      </div>

      <div className="min-w-0">
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <ErrorMessage message="Hubo un error al cargar las transacciones. Por favor, intenta nuevamente." />
        ) : !transactions || transactions.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-belo-dark-border bg-belo-dark-surface">
            <Wallet className="w-16 h-16 text-belo-light-muted mb-4 stroke-[1.5]" />
            <p className="text-lg font-medium text-belo-light-text mb-1">
              Aún no hay movimientos en esta cuenta.
            </p>
            <p className="text-sm text-belo-light-muted">
              {userIdFilter
                ? 'Este usuario no tiene transacciones registradas todavía.'
                : 'No se encontraron transacciones en el sistema.'}
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {transactions.map((tx) => {
              const isOrigen = userIdFilter ? tx.origenId === userIdFilter : false;
              const montoColor = isOrigen ? 'text-belo-green' : 'text-belo-light-text';
              const glowClass = tx.estado === 'PENDIENTE' 
                ? DESIGN_VARIANCE.glow.pendiente 
                : tx.estado === 'RECHAZADA'
                  ? DESIGN_VARIANCE.glow.rechazada
                  : 'hover:border-belo-purple/30';

              return (
                <Card 
                  key={tx.id} 
                  className={`flex flex-col gap-2 ${glowClass} ${MOTION_INTENSITY.hover} border border-white/[0.04]`}
                >
                  {/* Primera línea */}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-belo-light-text">
                      {getUserName(tx.destinoId, usersData)}
                    </span>
                    <span className={`text-xl font-bold ${montoColor}`}>
                      {formatCurrency(tx.monto)}
                    </span>
                  </div>

                  {/* Segunda línea */}
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-belo-light-muted">
                      Desde: <span className="font-medium text-belo-light-text">{getUserName(tx.origenId, usersData)}</span>
                    </span>
                    <div className="flex flex-col items-end">
                      <StatusBadge status={tx.estado} />
                      {tx.estado === 'RECHAZADA' && tx.motivoRechazo && (
                        <span className="text-[10px] text-belo-semantic-error font-medium mt-1 max-w-[180px] text-right" title={tx.motivoRechazo}>
                          Motivo: {tx.motivoRechazo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tercera línea */}
                  <div className="text-belo-light-muted text-xs">
                    {formatDate(tx.fecha)}
                  </div>
                </Card>
              );
            })}

            {/* Controles de Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-2">
                <Button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  variant="secondary"
                  className="!px-4 h-9 !min-h-[36px]"
                >
                  &larr; Anterior
                </Button>
                <span className="text-xs text-belo-light-muted font-medium">
                  Página <span className="font-semibold text-belo-light-text">{page}</span> de <span className="font-semibold text-belo-light-text">{pagination.totalPages}</span>
                </span>
                <Button
                  onClick={handleNextPage}
                  disabled={page >= pagination.totalPages}
                  variant="secondary"
                  className="!px-4 h-9 !min-h-[36px]"
                >
                  Siguiente &rarr;
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
