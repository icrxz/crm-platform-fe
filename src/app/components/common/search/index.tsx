'use client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';

interface SearchProps {
  placeholder: string;
  initialValue: string;
  handleSearch: (value: string) => void;
}

export default function Search({ placeholder, initialValue, handleSearch }: SearchProps) {
  const searchDebounceCallback = useDebouncedCallback((params: string) => {
    handleSearch(params);
  }, 1000);

  return (
    <div className="relative flex flex-1 flex-shrink-0 max-w-1/2">
      <label htmlFor="search" className="sr-only">
        Buscar
      </label>

      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 mr-4"
        placeholder={placeholder}
        onChange={(e) => {
          searchDebounceCallback(e.target.value);
        }}
        defaultValue={initialValue}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
