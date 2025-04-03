"use client";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';

import { Button } from '../../components/common/button';
import Search from '../../components/common/search';
import { isDocument } from '../../libs/parser';
import { FilterModal } from './filter-modal';

interface PartnersSearchBarProps {
  setIsCreationModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function PartnersSearchBar({ setIsCreationModalOpen }: PartnersSearchBarProps) {
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
      }
    } else {
      params.delete('documento');
      params.delete('nome');
    }
    
    params.set('page', '1');

    router.push(pathname + '?' + params.toString());
  }

  return (
    <div className="flex w-full p-4 bg-gray-100 rounded-lg shadow-md">
      <Search placeholder="Buscar técnicos pelo nome ou documento..." handleSearch={handleSearch} initialValue={searchParams.get('documento') || ''} />

      <Button
          className="p-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => setShowFilterModal(true)}
        >
          Filtros
        </Button>

      <div className='flex w-1/2 justify-end'>
        <Button
          className="p-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => setIsCreationModalOpen(true)}
        >
          Criar
        </Button>
      </div>

      {showFilterModal && <FilterModal isModalOpen={showFilterModal} onClose={() => setShowFilterModal(false)} />}
    </div>
  );
}
