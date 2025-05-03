"use client"
import { brazilStates } from "@/app/types/address";
import { Contractor } from "@/app/types/contractor";
import { months } from "@/app/types/month";
import { Partner } from "@/app/types/partner";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from "../common/button";
import { Dropdown } from "../common/dropdown/dropdown";
import { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface ControlPanelSearchProps {
  contractors: Contractor[];
  partners: Partner[];
}

export default function ControlPanelSearch({ contractors, partners }: ControlPanelSearchProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [partnerId, setPartnerId] = useState(searchParams.get('tecnico') || '');
  const [state, setState] = useState(searchParams.get('estado') || '');
  const [contractorId, setContractorId] = useState(searchParams.get('seguradora') || '');
  const [month, setMonth] = useState(searchParams.get('mes') || months[new Date().getMonth()]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    partnerId ? params.set('tecnico', partnerId) : params.delete('tecnico');
    state ? params.set('estado', state) : params.delete('estado');
    contractorId ? params.set('seguradora', contractorId) : params.delete('seguradora');
    month ? params.set('mes', month) : params.delete('mes');

    router.push(pathname + '?' + params.toString());
  }

  const handleClean = () => {
    setPartnerId('');
    setState('');
    setContractorId('');
    setMonth('');
    router.push(pathname);
  }

  return (
    <div className="flex items-center bg-gray-100 px-4 pt-4 pb-2 rounded-lg shadow-md mb-6">
      <div className='grid w-full gap-3 grid-cols-4'>
        <Dropdown
          onChange={(val) => setMonth(val)}
          label="Mês"
          name="month"
          className="mb-2"
          options={months.map((month) => ({
            id: month,
            value: month,
            label: month
          }))}
          value={month}
        />

        <Dropdown
          onChange={(val) => setState(val)}
          label="Estado"
          name="state"
          className="mb-2"
          options={brazilStates.map((state) => ({
            id: state,
            value: state,
            label: state
          }))}
          optional
          value={state}
        />

        <Dropdown
          onChange={(val) => setContractorId(val)}
          label="Seguradora"
          name="contractor"
          className="mb-2"
          options={contractors?.map((contractor) => ({
            id: contractor.contractor_id,
            value: contractor.contractor_id,
            label: contractor.company_name,
          })) || []}
          optional
          value={contractorId}
        />

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
          defaultItems={partners}
        >
          {(item) => (
            <AutocompleteItem key={item.partner_id}>
              {`${item.first_name} ${item.last_name} - ${item.shipping.city} / ${item.shipping.state}`}
            </AutocompleteItem >
          )}
        </Autocomplete>
      </div>

      <div className='flex w-1/2 justify-end mr-4 gap-4'>
        <Button size='lg' color='success' onClick={() => handleSearch()}>
          Filtrar
        </Button>

        <Button size='lg' color='error' onClick={() => handleClean()}>
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}