"use client";
import { Dispatch, SetStateAction } from 'react';

import { Button } from '../../components/common/button';
import Search from '../../components/common/search';

interface ContractorsSearchBarProps {
  setIsFilterModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreationModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ContractorsSearchBar({ setIsCreationModalOpen, setIsFilterModalOpen }: ContractorsSearchBarProps) {
  return (
    <div className="flex items-center p-4 bg-gray-100 rounded-lg shadow-md">
      <Search placeholder="Buscar contratantes..." />

      <Button className="p-2 mr-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsFilterModalOpen(true)}>
        Filtros
      </Button>

      <Button
        className="p-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        onClick={() => setIsCreationModalOpen(true)}
      >
        Criar
      </Button>
    </div>
  );
}
