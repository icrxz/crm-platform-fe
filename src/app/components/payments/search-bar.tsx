'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Key } from '@react-types/shared';

import Search from '../../components/common/search';
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Partner } from '@/app/types/partner';

interface PaymentsSearchBarProps {
  partners?: Partner[];
}

export default function PaymentsSearchBar({
  partners,
}: PaymentsSearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [partnerId, setPartnerId] = useState(searchParams.get('tecnico') || '');

  const handleSearch = (receivedValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (receivedValue) {
      params.set('sinistro', receivedValue);
    } else {
      params.delete('sinistro');
    }

    params.set('page', '1');

    router.push(pathname + '?' + params.toString());
  };

  const handlePartnerChange = (key: Key | null) => {
    const newPartnerId = key?.toString() ?? '';
    setPartnerId(newPartnerId);

    const params = new URLSearchParams(searchParams.toString());
    if (newPartnerId) {
      params.set('tecnico', newPartnerId);
    } else {
      params.delete('tecnico');
    }
    params.set('page', '1');
    router.push(pathname + '?' + params.toString());
  };

  return (
    <div className="flex w-full items-center gap-4 rounded-lg bg-gray-100 p-4 shadow-md">
      <div className="w-96 shrink-0">
        <Search
          placeholder="Buscar pagamentos pelo sinistro"
          handleSearch={handleSearch}
          initialValue={searchParams.get('sinistro') || ''}
        />
      </div>

      <div className="w-80 shrink-0">
        <Autocomplete
          aria-label="Técnico responsável"
          placeholder="Selecione um técnico"
          classNames={{
            listboxWrapper: 'max-h-[320px]',
            selectorButton: 'text-default-500',
            base: 'text-sm font-medium text-gray-700',
          }}
          variant="bordered"
          radius="sm"
          inputProps={{
            classNames: {
              input: 'border-none focus:ring-0',
              inputWrapper: 'bg-white border border-gray-300',
            },
          }}
          startContent={
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          }
          value={partnerId || undefined}
          onChange={handlePartnerChange}
          defaultItems={partners || []}
        >
          {(item) => (
            <AutocompleteItem key={item.partner_id}>
              {`${item.first_name} ${item.last_name} - ${item.shipping.city} / ${item.shipping.state}`}
            </AutocompleteItem>
          )}
        </Autocomplete>
      </div>
    </div>
  );
}
