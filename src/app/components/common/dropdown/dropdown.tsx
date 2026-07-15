'use client';

import { ErrorMessage } from '../error-message';

export interface DropdownOption {
  id: string;
  value: string;
  label: string;
}

interface DropdownProps {
  name: string;
  label: string;
  options: Array<DropdownOption>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  optional?: boolean;
  error?: string;
}

export function Dropdown({
  label,
  name,
  options,
  placeholder,
  required,
  className,
  defaultValue,
  onChange,
  optional,
  value,
  disabled,
  error,
}: DropdownProps) {
  const borderColor = error ? 'border-red-500' : 'border-gray-200';

  return (
    <div className={className}>
      <label
        className="mb-3 block text-xs font-medium text-gray-900"
        htmlFor={name}
      >
        {label}
      </label>

      <div className="relative">
        <select
          className={`peer block w-full rounded-md border ${borderColor} py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100`}
          id={name}
          name={name}
          required={required}
          disabled={disabled}
          {...(value !== undefined
            ? { value, onChange: (e) => onChange && onChange(e.target.value) }
            : {
                defaultValue: defaultValue || '',
                onChange: (e) => onChange && onChange(e.target.value),
              })}
        >
          {placeholder && <option value="">{placeholder}</option>}

          {optional && <option value=""></option>}

          {options.map((opt) => (
            <option key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorMessage message={error} />}
    </div>
  );
}
