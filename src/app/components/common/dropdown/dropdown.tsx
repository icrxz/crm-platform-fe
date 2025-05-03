"useClient";

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
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  optional?: boolean;
}

export function Dropdown({ label, name, options, placeholder, required, className, defaultValue, onChange, optional, value }: DropdownProps) {
  return (
    <div className={className}>
      <label className="mb-3 block text-xs font-medium text-gray-900" htmlFor={name}>
        {label}
      </label>

      <select
        className="peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500"
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        value={value}
      >
        {placeholder && <option value="">{placeholder}</option>}

        {optional && <option value=""></option>}

        {options.map(opt => (
          <option key={opt.id} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}