'use client';
import { brazilStates } from '@/app/types/address';
import { Contractor } from '@/app/types/contractor';
import { months } from '@/app/types/month';
import { Partner } from '@/app/types/partner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../common/button';
import { Dropdown } from '../common/dropdown/dropdown';
import { useState } from 'react';
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { Key } from '@react-types/shared';

interface ControlPanelSearchProps {
  contractors: Contractor[];
  partners: Partner[];
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

export default function ControlPanelSearch({
  contractors,
  partners,
}: ControlPanelSearchProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [partnerId, setPartnerId] = useState(searchParams.get('tecnico') || '');
  const [state, setState] = useState(searchParams.get('estado') || '');
  const [contractorId, setContractorId] = useState(
    searchParams.get('seguradora') || ''
  );
  const [month, setMonth] = useState(
    searchParams.get('mes') || months[new Date().getMonth()]
  );
  const [ano, setAno] = useState(
    searchParams.get('ano') || String(currentYear)
  );

  const handlePartnerChange = (key: Key | null) => {
    const newPartnerId = key?.toString() || '';
    setPartnerId(newPartnerId);
    if (!newPartnerId) {
      setMonth(months[new Date().getMonth()]);
      setAno(String(currentYear));
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    partnerId ? params.set('tecnico', partnerId) : params.delete('tecnico');
    state ? params.set('estado', state) : params.delete('estado');
    contractorId
      ? params.set('seguradora', contractorId)
      : params.delete('seguradora');
    month ? params.set('mes', month) : params.delete('mes');
    ano ? params.set('ano', ano) : params.delete('ano');

    router.push(pathname + '?' + params.toString());
  };

  const handleClean = () => {
    setPartnerId('');
    setState('');
    setContractorId('');
    setMonth(months[new Date().getMonth()]);
    setAno(String(currentYear));
    router.push(pathname);
  };

  return (
    <div className="mb-6 flex items-center rounded-lg bg-gray-100 px-4 pb-2 pt-4 shadow-md">
      <div className="flex w-full items-end gap-3">
        <Dropdown
          onChange={(val) => setMonth(val)}
          label="Mês"
          name="month"
          className="mb-2 w-28 shrink-0"
          options={months.map((m) => ({
            id: m,
            value: m,
            label: m,
          }))}
          optional={!!partnerId}
          value={month}
        />

        <Dropdown
          onChange={(val) => setAno(val)}
          label="Ano"
          name="year"
          className="mb-2 w-24 shrink-0"
          options={years.map((y) => ({
            id: y,
            value: y,
            label: y,
          }))}
          optional={!!partnerId}
          value={ano}
        />

        <Dropdown
          onChange={(val) => setState(val)}
          label="Estado"
          name="state"
          className="mb-2 flex-1"
          options={brazilStates.map((s) => ({
            id: s,
            value: s,
            label: s,
          }))}
          optional
          value={state}
        />

        <Dropdown
          onChange={(val) => setContractorId(val)}
          label="Seguradora"
          name="contractor"
          className="mb-2 flex-1"
          options={
            contractors?.map((contractor) => ({
              id: contractor.contractor_id,
              value: contractor.contractor_id,
              label: contractor.company_name,
            })) || []
          }
          optional
          value={contractorId}
        />

        <Autocomplete
          label="Técnico responsável"
          placeholder="Selecione um técnico"
          classNames={{
            listboxWrapper: 'max-h-[320px]',
            selectorButton: 'text-default-500',
            base: 'flex-1 mb-2 text-sm font-medium text-gray-700',
          }}
          labelPlacement="outside"
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
          defaultItems={partners}
        >
          {(item) => (
            <AutocompleteItem key={item.partner_id}>
              {`${item.first_name} ${item.last_name} - ${item.shipping.city} / ${item.shipping.state}`}
            </AutocompleteItem>
          )}
        </Autocomplete>
      </div>

      <div className="mr-4 flex w-1/2 justify-end gap-4">
        <Button size="lg" color="success" onClick={() => handleSearch()}>
          Filtrar
        </Button>

        <Button size="lg" color="error" onClick={() => handleClean()}>
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
