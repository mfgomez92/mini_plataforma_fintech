import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button component', () => {
  it('renders correctly with its text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders in loading state correctly', () => {
    render(<Button isLoading={true}>Click me</Button>);

    // a) El texto desaparece o no se muestra
    expect(screen.queryByText(/click me/i)).not.toBeInTheDocument();

    // b) Se renderiza un elemento SVG (el spinner)
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner.tagName.toLowerCase()).toBe('svg');

    // c) El botón queda en estado deshabilitado (clase pointer-events-none y atributo disabled)
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('pointer-events-none');
  });

  it('reacts correctly to the onClick event', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled or loading', () => {
    const handleClick = vi.fn();
    
    // Test disabled state
    const { rerender } = render(<Button onClick={handleClick} disabled>Click me</Button>);
    let button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();

    // Test loading state
    rerender(<Button onClick={handleClick} isLoading>Click me</Button>);
    button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
