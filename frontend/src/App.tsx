import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CreateTransaction from './pages/CreateTransaction';
import ApproveTransaction from './pages/ApproveTransaction';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = 1000; // Retraso de inicio de 1 segundo

    const connectSSE = () => {
      const sseUrl = import.meta.env.DEV
        ? 'http://localhost:3000/api/events'
        : '/api/events';

      if (import.meta.env.DEV) {
        console.log(`[SSE] Conectando a stream de eventos en tiempo real en ${sseUrl} (reintento en: ${reconnectDelay}ms)...`);
      }
      
      eventSource = new EventSource(sseUrl, { withCredentials: true });

      eventSource.addEventListener('transaction_updated', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (import.meta.env.DEV) {
            console.log('[SSE] Notificación recibida. Transacción actualizada:', data);
          }
          // Invalidar transacciones para refrescar el dashboard y listas
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          // Invalidar usuarios para actualizar los balances/saldos en la UI
          queryClient.invalidateQueries({ queryKey: ['users'] });
          reconnectDelay = 1000; // Resetear intervalo ante conexión exitosa
        } catch (err) {
          console.error('[SSE] Error al procesar mensaje del servidor:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.error('[SSE] Conexión SSE interrumpida. Reintentando...', err);
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        reconnectTimeout = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, 30000); // Exponencial hasta 30s
          connectSSE();
        }, reconnectDelay);
      };
    };

    connectSSE();

    return () => {
      if (import.meta.env.DEV) {
        console.log('[SSE] Cerrando stream de eventos en tiempo real.');
      }
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreateTransaction />} />
            <Route path="approve" element={<ApproveTransaction />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;