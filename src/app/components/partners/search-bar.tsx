'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';

import { Button } from '../../components/common/button';
import Search from '../../components/common/search';
import { isDocument } from '../../libs/parser';
import { FilterModal } from './filter-modal';

interface PartnersSearchBarProps {
  setIsCreationModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function PartnersSearchBar({
  setIsCreationModalOpen,
}: PartnersSearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleSearch = (receivedValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (receivedValue) {
      if (isDocument(receivedValue)) {
        params.set('documento', receivedValue);
      } else {
        params.set('nome', receivedValue);
        params.set('cidade', receivedValue);
      }
    } else {
      params.delete('documento');
      params.delete('nome');
      params.delete('cidade');
    }

    params.set('page', '1');

    router.push(pathname + '?' + params.toString());
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-100 p-3 shadow-md">
      <Search
        placeholder="Buscar técnicos pelo nome, cidade ou documento..."
        handleSearch={handleSearch}
        initialValue={searchParams.get('documento') || ''}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Button
          color="neutral"
          scheme="quiet"
          className="rounded-lg p-2"
          onClick={() => setShowFilterModal(true)}
        >
          Filtros
        </Button>

        <Button
          className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => setIsCreationModalOpen(true)}
        >
          Criar
        </Button>
      </div>

      {showFilterModal && (
        <FilterModal
          isModalOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}
