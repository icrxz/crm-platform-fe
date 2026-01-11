"use client";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Search from '../../components/common/search';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Partner } from '@/app/types/partner';

interface PaymentsSearchBarProps {
  partners?: Partner[];
}

export default function PaymentsSearchBar({ partners }: PaymentsSearchBarProps) {
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
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (!partnerId || partnerId === "") {
      params.delete('tecnico');
    } else {
      params.set('tecnico', partnerId);
    }

    params.set('page', '1');

    router.push(pathname + '?' + params.toString());
  }, [partnerId]);

  return (
    <div className="flex w-full p-4 bg-gray-100 rounded-lg shadow-md gap-4">
      <Search placeholder="Buscar pagamentos pelo sinistro" handleSearch={handleSearch} initialValue={searchParams.get('sinistro') || ''} />

      <Autocomplete
          label="Técnico responsável"
          placeholder="Selecione um técnico"
          classNames={{
            listboxWrapper: "max-h-[320px]",
            selectorButton: "text-default-500",
            base: "text-sm font-medium text-gray-700",
          }}
          labelPlacement="outside"
          variant="bordered"
          radius="sm"
          inputProps={{
            classNames: {
              input: "border-none focus:ring-0",
              inputWrapper: "bg-white border border-gray-300",
            }
          }}
          startContent={<MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />}
          selectedKey={partnerId}
          onSelectionChange={(key) => {
            setPartnerId(key?.toString() || '');
          }}
          defaultItems={partners || []}
        >
          {(item) => (
            <AutocompleteItem key={item.partner_id}>
              {`${item.first_name} ${item.last_name} - ${item.shipping.city} / ${item.shipping.state}`}
            </AutocompleteItem >
          )}
        </Autocomplete>
    </div>
  );
}
