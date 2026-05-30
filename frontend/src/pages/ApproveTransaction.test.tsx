import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApproveTransaction } from './ApproveTransaction';
import { useTransactions } from '../hooks/useTransactions';
import { useApproveTransaction, useRejectTransaction } from '../hooks/useTransactionActions';
import { useUsers } from '../hooks/useUsers';

// 1. Configuración (Setup) - Mocks de hooks
vi.mock('../hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
}));

vi.mock('../hooks/useTransactionActions', () => ({
  useApproveTransaction: vi.fn(),
  useRejectTransaction: vi.fn(),
}));

vi.mock('../hooks/useUsers', () => ({
  useUsers: vi.fn(),
}));

const mockApprove = vi.fn();
const mockReject = vi.fn();

// Mock Data
const mockTransactions = [
  {
    id: 'tx-1',
    origenId: 'a0000000-0000-0000-0000-000000000001', // Alice Smith
    destinoId: 'b0000000-0000-0000-0000-000000000002', // Bob Johnson
    monto: '1000.00',
    estado: 'PENDIENTE',
    fecha: '2026-05-30T00:00:00Z',
  },
  {
    id: 'tx-2',
    origenId: 'b0000000-0000-0000-0000-000000000002', // Bob Johnson
    destinoId: 'c0000000-0000-0000-0000-000000000003', // Charlie Brown
    monto: '2500.00',
    estado: 'CONFIRMADA',
    fecha: '2026-05-29T12:00:00Z',
  },
];

describe('ApproveTransaction Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configuración por defecto de las acciones de aprobación/rechazo
    vi.mocked(useApproveTransaction).mockReturnValue({
      mutate: mockApprove,
      isPending: false,
    } as unknown as ReturnType<typeof useApproveTransaction>);
    
    vi.mocked(useRejectTransaction).mockReturnValue({
      mutate: mockReject,
      isPending: false,
    } as unknown as ReturnType<typeof useRejectTransaction>);

    vi.mocked(useUsers).mockReturnValue({
      data: [
        { id: 'a0000000-0000-0000-0000-000000000001', nombre: 'Alice Smith' },
        { id: 'b0000000-0000-0000-0000-000000000002', nombre: 'Bob Johnson' },
        { id: 'c0000000-0000-0000-0000-000000000003', nombre: 'Charlie Brown' },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useUsers>);
  });

  // 2. Test 1: "Muestra el estado de carga correctamente"
  it('renders loading spinner when transactions are loading', () => {
    vi.mocked(useTransactions).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useTransactions>);

    const { container } = render(<ApproveTransaction />);
    
    // Busca por la clase animate-spin o selector equivalente
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  // 3. Test 2: "Renderiza el Empty State cuando no hay transacciones pendientes"
  it('renders Empty State when there are no pending transactions', () => {
    // Simula que solo hay transacciones confirmadas
    vi.mocked(useTransactions).mockReturnValue({
      data: {
        transactions: [mockTransactions[1]],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useTransactions>);

    render(<ApproveTransaction />);
    
    expect(screen.getByText('No hay transacciones pendientes.')).toBeInTheDocument();
  });

  // 4. Test 3: "Filtra y muestra únicamente las transacciones PENDIENTES"
  it('filters and displays only PENDIENTE transactions', () => {
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

    render(<ApproveTransaction />);

    // Debería renderizarse el monto de la pendiente ($1.000,00) pero no de la confirmada ($2.500,00)
    // El formateador utiliza formato de moneda localizado
    expect(screen.getByText('$ 1.000,00')).toBeInTheDocument();
    expect(screen.queryByText('$ 2.500,00')).not.toBeInTheDocument();

    // Comprueba que los botones Aprobar y Rechazar existan para la transacción pendiente
    expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
  });

  // 5. Test 4: "Abre el modal de rechazo, permite escribir un motivo y llama a la mutación"
  it('opens rejection modal, writes reason and submits the reject mutation', () => {
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

    render(<ApproveTransaction />);

    // Abre el modal de rechazo
    const rejectBtn = screen.getByRole('button', { name: /rechazar/i });
    fireEvent.click(rejectBtn);

    // Verifica que el modal esté abierto buscando el texto conversacional
    expect(screen.getByText('¿Estás seguro de rechazar este envío?')).toBeInTheDocument();

    // Escribe el motivo
    const input = screen.getByLabelText('¿Por qué rechazas esta operación? (opcional)');
    fireEvent.change(input, { target: { value: 'Fondos insuficientes en origen' } });

    // Clic en Confirmar Rechazo en el modal
    const confirmBtn = screen.getByRole('button', { name: 'Confirmar Rechazo' });
    fireEvent.click(confirmBtn);

    // Verifica la llamada de la mutación de rechazo con id y motivo
    expect(mockReject).toHaveBeenCalledTimes(1);
    expect(mockReject).toHaveBeenCalledWith(
      { id: 'tx-1', motivo: 'Fondos insuficientes en origen' },
      expect.any(Object)
    );
  });
});
