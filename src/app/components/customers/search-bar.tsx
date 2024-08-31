"use client";
import { Dispatch, SetStateAction } from 'react';

import { Button } from '../../components/common/button';
import Search from '../../components/common/search';

interface CustomersSearchBarProps {
  setIsFilterModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreationModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CustomersSearchBar({ setIsCreationModalOpen, setIsFilterModalOpen }: CustomersSearchBarProps) {
  return (
    <div className="flex items-center p-4 bg-gray-100 rounded-lg shadow-md">
      <Search placeholder="Buscar clientes..." />

      <div className='flex w-1/2 justify-end'>
        <Button
          className="p-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => setIsCreationModalOpen(true)}
        >
          Criar
        </Button>
      </div>
    </div>
  );
}
