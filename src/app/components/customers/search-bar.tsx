'use client';
import { Dispatch, SetStateAction } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../../components/common/button';
import Search from '../../components/common/search';

interface CustomersSearchBarProps {
  setIsFilterModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreationModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CustomersSearchBar({
  setIsCreationModalOpen,
  setIsFilterModalOpen,
}: CustomersSearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (receivedValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    receivedValue
      ? params.set('documento', receivedValue)
      : params.delete('documento');
    params.set('page', '1');

    router.push(pathname + '?' + params.toString());
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-100 p-3 shadow-md">
      <Search
        placeholder="Buscar clientes..."
        initialValue={searchParams.get('documento') || ''}
        handleSearch={handleSearch}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Button
          className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => setIsCreationModalOpen(true)}
        >
          Criar
        </Button>
      </div>
    </div>
  );
}
