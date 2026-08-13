'use client';
import { Checkbox } from '@heroui/checkbox';
import { Tooltip } from '@heroui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '../../components/common/button';
import Search from '../../components/common/search';
import {
  clearStoredCaseFilters,
  getStoredCaseFilters,
  setStoredCaseFilters,
} from '../../libs/case-filters-storage';

interface CasesSearchBarProps {
  setIsFilterModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreationModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsCreationBatchModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CasesSearchBar({
  setIsFilterModalOpen,
  setIsCreationModalOpen,
  setIsCreationBatchModalOpen,
}: CasesSearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const hasFilterParams =
    searchParams.has('status') ||
    searchParams.has('contractor_id') ||
    searchParams.has('only_mine');

  useEffect(() => {
    if (hasFilterParams) return;

    const stored = getStoredCaseFilters();
    if (
      !stored.status?.length &&
      !stored.contractorId?.length &&
      !stored.onlyMine
    )
      return;

    const params = new URLSearchParams(searchParams.toString());
    stored.status?.forEach((value) => params.append('status', value));
    stored.contractorId?.forEach((value) =>
      params.append('contractor_id', value)
    );
    if (stored.onlyMine) params.set('only_mine', 'true');

    router.replace(pathname + '?' + params.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (receivedValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    receivedValue
      ? params.set('sinistro', receivedValue)
      : params.delete('sinistro');
    params.set('page', '1');

    router.push(pathname + '?' + params.toString());
  };

  const handleOnlyMineChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    checked ? params.set('only_mine', 'true') : params.delete('only_mine');
    params.set('page', '1');

    setStoredCaseFilters({ ...getStoredCaseFilters(), onlyMine: checked });
    router.push(pathname + '?' + params.toString());
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('contractor_id');
    params.delete('only_mine');
    params.set('page', '1');

    clearStoredCaseFilters();
    router.push(pathname + '?' + params.toString());
  };

  const hasActiveFilters = hasFilterParams;

  return (
    <div className="flex w-full flex-wrap items-start justify-between gap-3 rounded-lg bg-gray-100 p-4 shadow-md">
      <div className="flex w-full max-w-md flex-col gap-2">
        <Search
          placeholder="Buscar casos..."
          initialValue={searchParams.get('sinistro') || ''}
          handleSearch={handleSearch}
        />

        <Checkbox
          className="pl-4"
          isSelected={searchParams.get('only_mine') === 'true'}
          onValueChange={handleOnlyMineChange}
          id="only_mine"
          name="only_mine"
          size="sm"
        >
          Atribuídos a mim
        </Checkbox>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-10 items-stretch overflow-hidden rounded-lg">
          <Button
            className="rounded-r-none bg-gray-500 p-2 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filtros
          </Button>

          {hasActiveFilters && (
            <Tooltip content="Limpar filtros" size="sm">
              <button
                type="button"
                aria-label="Limpar filtros"
                onClick={handleClearFilters}
                className="flex h-full w-10 items-center justify-center border-l border-gray-400 bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </Tooltip>
          )}
        </div>

        <Button
          className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          onClick={() => setIsCreationModalOpen(true)}
        >
          Criar
        </Button>

        <Button
          className="rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsCreationBatchModalOpen(true)}
        >
          Criar em lote
        </Button>
      </div>
    </div>
  );
}
