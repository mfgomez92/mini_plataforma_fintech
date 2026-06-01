import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

/**
 * Crea un QueryClient aislado para cada test.
 * retry: false → evita reintentos que ralentizan los tests.
 */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

/**
 * Wrapper de render que provee QueryClientProvider + BrowserRouter.
 * Usar en todos los tests de componentes que dependan de React Query o Router.
 *
 * @example
 * renderWithProviders(<Dashboard />);
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const testQueryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
    options,
  );
}
