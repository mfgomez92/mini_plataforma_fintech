import React, { useCallback, type ChangeEvent } from 'react';
import { DESIGN_VARIANCE, MOTION_INTENSITY } from '../utils/theme';

interface UserSelectorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholderSelect: string;
  users: { id: string; nombre: string }[];
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  id,
  label,
  value,
  onChange,
  placeholderSelect,
  users,
}) => {
  const handleSelectChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange(val);
  }, [onChange]);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-belo-light-muted mb-1.5">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={handleSelectChange}
        required
        className={`w-full px-4 py-2 bg-belo-dark-surface border border-belo-dark-border ${DESIGN_VARIANCE.borderRadius.input} text-belo-light-text focus:outline-none focus:ring-2 focus:ring-belo-green min-h-touch ${MOTION_INTENSITY.transition}`}
      >
        <option value="" className="bg-belo-dark-surface">{placeholderSelect}</option>
        {users.map(u => (
          <option key={u.id} value={u.id} className="bg-belo-dark-surface">{u.nombre}</option>
        ))}
      </select>

    </div>
  );
};
