import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import CreateTransaction from './CreateTransaction';
import { useCreateTransaction } from '../hooks/useCreateTransaction';
import { useUsers } from '../hooks/useUsers';

// 1. Configuración inicial (Setup) - Mocks de hooks
vi.mock('../hooks/useCreateTransaction', () => {
  return {
    useCreateTransaction: vi.fn(),
  };
});

vi.mock('../hooks/useUsers', () => {
  return {
    useUsers: vi.fn(),
  };
});

const mockMutate = vi.fn();
const mockReset = vi.fn();

describe('CreateTransaction Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Retorno por defecto de los hooks mockeados
    vi.mocked(useCreateTransaction).mockReturnValue({
      mutate: mockMutate,
      reset: mockReset,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateTransaction>);

    vi.mocked(useUsers).mockReturnValue({
      data: [
        { id: 'a0000000-0000-0000-0000-000000000001', nombre: 'Alice Smith' },
        { id: 'b0000000-0000-0000-0000-000000000002', nombre: 'Bob Johnson' },
        { id: 'c0000000-0000-0000-0000-000000000003', nombre: 'Charlie Brown' },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useUsers>);
  });

  // 2. Test 1: "Renderiza correctamente el formulario y los textos conversacionales"
  it('renders correctly the form and conversational microcopy', () => {
    renderWithProviders(<CreateTransaction />);

    // Título
    expect(screen.getByRole('heading', { name: /enviar dinero/i })).toBeInTheDocument();

    // Textos conversacionales (labels)
    expect(screen.getByLabelText('¿Desde qué cuenta envías?')).toBeInTheDocument();
    expect(screen.getByLabelText('¿A quién le quieres enviar?')).toBeInTheDocument();
    expect(screen.getByLabelText('¿Cuánto vas a transferir?')).toBeInTheDocument();

    // Botón de submit
    expect(screen.getByRole('button', { name: /confirmar envío/i })).toBeInTheDocument();
  });

  // 3. Test 2: "Muestra estado de carga y deshabilita el botón al procesar"
  it('shows loading state and disables the button when processing', () => {
    vi.mocked(useCreateTransaction).mockReturnValue({
      mutate: mockMutate,
      reset: mockReset,
      isPending: true,
      isError: false,
      isSuccess: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateTransaction>);

    renderWithProviders(<CreateTransaction />);

    // Al estar isLoading={true}, nuestro botón del UI Kit deshabilita la interacción
    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('pointer-events-none');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  // 4. Test 3: "Llama a la función mutate con los datos correctos al enviar el formulario"
  it('calls mutate with correct data when the form is submitted', async () => {
    renderWithProviders(<CreateTransaction />);

    const origenSelect = screen.getByLabelText('¿Desde qué cuenta envías?') as HTMLSelectElement;
    const destinoSelect = screen.getByLabelText('¿A quién le quieres enviar?') as HTMLSelectElement;
    const montoInput = screen.getByLabelText('¿Cuánto vas a transferir?') as HTMLInputElement;
    const form = origenSelect.closest('form') as HTMLFormElement;

    // Selección de usuario de origen (Alice Smith)
    fireEvent.change(origenSelect, { target: { value: 'a0000000-0000-0000-0000-000000000001' } });

    // Selección de usuario de destino (Bob Johnson)
    fireEvent.change(destinoSelect, { target: { value: 'b0000000-0000-0000-0000-000000000002' } });

    // Monto de transferencia — RHF usa valueAsNumber: true en el register
    Object.defineProperty(montoInput, 'valueAsNumber', { value: 1500, configurable: true });
    fireEvent.change(montoInput, { target: { value: '1500' } });

    // Confirmar vía submit (RHF handleSubmit es async: valida con Zod antes de llamar mutate)
    await act(async () => {
      fireEvent.submit(form);
    });

    // waitFor espera a que la Promise del handleSubmit resuelva y llame a mutate
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    expect(mockMutate).toHaveBeenCalledWith(
      {
        origenId: 'a0000000-0000-0000-0000-000000000001',
        destinoId: 'b0000000-0000-0000-0000-000000000002',
        monto: 1500,
      },
      expect.any(Object)
    );
  });
});
