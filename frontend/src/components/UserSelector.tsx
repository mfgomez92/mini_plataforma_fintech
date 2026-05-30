import React, { useCallback, type ChangeEvent } from 'react';
import { DESIGN_VARIANCE, MOTION_INTENSITY } from '../utils/theme';

interface UserSelectorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isCustom: boolean;
  setIsCustom: (isCustom: boolean) => void;
  placeholderSelect: string;
  placeholderInput: string;
  users: { id: string; nombre: string }[];
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  id,
  label,
  value,
  onChange,
  isCustom,
  setIsCustom,
  placeholderSelect,
  placeholderInput,
  users,
}) => {
  const handleSelectChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustom(true);
      onChange('');
    } else {
      setIsCustom(false);
      onChange(val);
    }
  }, [onChange, setIsCustom]);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-belo-light-muted mb-1.5">
        {label}
      </label>
      {!isCustom ? (
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
          <option value="custom" className="bg-belo-dark-surface">Otro... (Ingresar UUID manualmente)</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-2 bg-transparent border border-belo-dark-border ${DESIGN_VARIANCE.borderRadius.input} text-belo-light-text focus:outline-none focus:ring-2 focus:ring-belo-green min-h-touch ${MOTION_INTENSITY.transition}`}
            placeholder={placeholderInput}
          />
          <button
            type="button"
            onClick={() => { setIsCustom(false); onChange(''); }}
            className={`px-4 py-2 bg-belo-dark-base text-belo-light-text border border-belo-dark-border rounded-xl hover:bg-belo-dark-surface min-h-touch text-sm font-medium ${MOTION_INTENSITY.transition} ${MOTION_INTENSITY.active}`}
          >
            Volver
          </button>
        </div>
      )}
    </div>
  );
};
