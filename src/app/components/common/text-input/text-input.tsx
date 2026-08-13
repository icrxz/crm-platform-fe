'use client';

import { HTMLInputTypeAttribute } from 'react';
import { ErrorMessage } from '../error-message';

interface TextInputProps {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function TextInput({
  label,
  name,
  type,
  placeholder,
  required,
  className,
  defaultValue,
  value,
  onChange,
  disabled,
  error,
}: TextInputProps) {
  const borderColor = error ? 'border-red-500' : 'border-gray-200';

  return (
    <div className={`${className ? className : ''}`}>
      <label
        className="mb-3 block text-xs font-medium text-gray-900"
        htmlFor={name}
      >
        {label}
      </label>

      <div className="relative">
        <input
          className={`peer block w-full rounded-md border ${borderColor} py-[9px] text-sm outline-2 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100`}
          id={name}
          type={type || 'text'}
          name={name}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          {...(value !== undefined
            ? { value, onChange }
            : { defaultValue, onChange })}
        />
      </div>

      {error && <ErrorMessage message={error} />}
    </div>
  );
}
