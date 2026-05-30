import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge component', () => {
  // 1. Test 1: renders correctly when status is CONFIRMADA
  it('renders correctly when status is CONFIRMADA', () => {
    render(<StatusBadge status="CONFIRMADA" />);
    const badge = screen.getByText('CONFIRMADA');
    
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-belo-green');
    expect(badge).toHaveClass('bg-belo-green/20');
  });

  // 2. Test 2: renders correctly when status is PENDIENTE
  it('renders correctly when status is PENDIENTE', () => {
    render(<StatusBadge status="PENDIENTE" />);
    const badge = screen.getByText('PENDIENTE');
    
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-belo-semantic-warning');
    expect(badge).toHaveClass('bg-belo-semantic-warning/20');
  });

  // 3. Test 3: renders correctly when status is RECHAZADA
  it('renders correctly when status is RECHAZADA', () => {
    render(<StatusBadge status="RECHAZADA" />);
    const badge = screen.getByText('RECHAZADA');
    
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-belo-semantic-error');
    expect(badge).toHaveClass('bg-belo-semantic-error/20');
  });

  // 4. Test 4: checks that custom classes are concatenated correctly
  it('concatenates custom className correctly to the component', () => {
    render(<StatusBadge status="CONFIRMADA" className="mt-4 custom-test-class" />);
    const badge = screen.getByText('CONFIRMADA');
    
    expect(badge).toHaveClass('mt-4');
    expect(badge).toHaveClass('custom-test-class');
    // Verifica que mantenga las clases base y del estado correspondientes
    expect(badge).toHaveClass('text-belo-green');
    expect(badge).toHaveClass('font-semibold');
  });
});
