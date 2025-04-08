"useClient";

import { HTMLInputTypeAttribute } from "react";

interface TextInputProps {
  name: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string;
}

export function TextInput({ label, name, type, placeholder, required, className, defaultValue }: TextInputProps) {
  return (
    <div className={`${className ? className : ''}`}>
      <label
        className="mb-3 block text-xs font-medium text-gray-900"
        htmlFor={name}
      >
        {label}
      </label>

      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
        id={name}
        type={type || "text"}
        name={name}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
      />
    </div>
  );
}