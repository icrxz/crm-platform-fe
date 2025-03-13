"use client";
import { Dispatch, SetStateAction, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '../../components/common/button';
import Search from '../../components/common/search';
import { FilterModal } from './filter-modal';

interface CasesSearchBarProps {
  setIsFilterModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreationModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreationBatchModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CasesSearchBar({ setIsCreationModalOpen, setIsCreationBatchModalOpen }: CasesSearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleSearch = (receivedValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    receivedValue ? params.set('sinistro', receivedValue) : params.delete('sinistro');
    params.set('page', '1');

    router.push(pathname + '?' + params.toString());
  }

  return (
    <>
      <div className="flex w-full p-4 bg-gray-100 rounded-lg shadow-md">
        <Search placeholder="Buscar casos..." initialValue={searchParams.get('sinistro') || ''} handleSearch={handleSearch} />

        {/* <Button
          className="p-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => setShowFilterModal(true)}
        >
          Filtros
        </Button> */}

        <div className='flex w-1/2 justify-end gap-2'>
          <Button
            className="p-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={() => setIsCreationModalOpen(true)}
          >
            Criar
          </Button>

          <Button
            className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsCreationBatchModalOpen(true)}
          >
            Criar em lote
          </Button>
        </div>
      </div>

      {/* {showFilterModal && <FilterModal isModalOpen={showFilterModal} onClose={() => setShowFilterModal(false)} />} */}
    </>
  );
}
