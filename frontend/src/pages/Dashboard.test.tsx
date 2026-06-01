import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import Dashboard from './Dashboard';
import { useTransactions } from '../hooks/useTransactions';
import { useUsers } from '../hooks/useUsers';

// 1. Mock de hooks
vi.mock('../hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
}));

vi.mock('../hooks/useUsers', () => ({
  useUsers: vi.fn(),
}));

// 2. Data de prueba (mock data)
const mockTransactions = [
  {
    id: 'tx-1',
    origenId: 'a0000000-0000-0000-0000-000000000001', // Alice Smith
    destinoId: 'b0000000-0000-0000-0000-000000000002', // Bob Johnson
    monto: '150.00',
    estado: 'CONFIRMADA',
    fecha: '2026-05-30T00:00:00Z',
  },
  {
    id: 'tx-2',
    origenId: 'b0000000-0000-0000-0000-000000000002', // Bob Johnson
    destinoId: 'c0000000-0000-0000-0000-000000000003', // Charlie Brown
    monto: '250.00',
    estado: 'PENDIENTE',
    fecha: '2026-05-29T12:00:00Z',
  },
];

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUsers).mockReturnValue({
      data: [
        { id: 'a0000000-0000-0000-0000-000000000001', nombre: 'Alice Smith' },
        { id: 'b0000000-0000-0000-0000-000000000002', nombre: 'Bob Johnson' },
        { id: 'c0000000-0000-0000-0000-000000000003', nombre: 'Charlie Brown' },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useUsers>);
  });

  // 3. Test 1: "Renderiza correctamente la lista de transacciones"
  it('renders correctly the list of transactions', () => {
    vi.mocked(useTransactions).mockReturnValue({
      data: {
        transactions: mockTransactions,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useTransactions>);

    renderWithProviders(<Dashboard />);

    // Verifica que el título esté en pantalla
    expect(screen.getByRole('heading', { name: /dashboard de transacciones/i })).toBeInTheDocument();

    // Verifica que se muestren los montos formateados
    expect(screen.getByText('$ 150,00')).toBeInTheDocument();
    expect(screen.getByText('$ 250,00')).toBeInTheDocument();

    // Verifica los usuarios destinatarios (usando getAllByText ya que también existen en las opciones del select)
    expect(screen.getAllByText('Bob Johnson').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Charlie Brown').length).toBeGreaterThan(0);
  });

  // 4. Test 2: "Actualiza el filtro de usuario al seleccionar una opción del dropdown"
  it('updates the user filter on dropdown selection', () => {
    vi.mocked(useTransactions).mockReturnValue({
      data: {
        transactions: mockTransactions,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useTransactions>);

    renderWithProviders(<Dashboard />);

    const select = screen.getByLabelText('Filtrar por Usuario');

    // Cambia el valor del select a Alice Smith (ID: a0000000-0000-0000-0000-000000000001)
    fireEvent.change(select, { target: { value: 'a0000000-0000-0000-0000-000000000001' } });

    // Verifica que el valor del select haya cambiado
    expect((select as HTMLSelectElement).value).toBe('a0000000-0000-0000-0000-000000000001');
  });

  // 5. Test 3: "Muestra el Empty State cuando no hay data"
  it('shows the Empty State when there are no transactions', () => {
    vi.mocked(useTransactions).mockReturnValue({
      data: {
        transactions: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useTransactions>);

    renderWithProviders(<Dashboard />);

    // Verifica el texto conversacional del Empty State
    expect(screen.getByText('Aún no hay movimientos en esta cuenta.')).toBeInTheDocument();
  });
});
