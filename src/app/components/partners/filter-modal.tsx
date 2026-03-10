'use client';
import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { roboto } from '@/app/ui/fonts';

import Modal from '../common/modal';
import { Button } from '../common/button';
import { TextInput } from '../common/text-input/text-input';
import { Dropdown, DropdownOption } from '../common/dropdown/dropdown';
import { brazilStates } from '../../types/address';

interface FilterModalProps {
  isModalOpen: boolean;
  onClose(): void;
}

export function FilterModal({ onClose, isModalOpen }: FilterModalProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const name = searchParams.get('nome') || '';
  const city = searchParams.get('cidade') || '';
  const state = searchParams.get('estado') || '';
  const stateOptions = useMemo(
    () =>
      brazilStates.map((state) => ({
        id: state,
        value: state,
        label: state,
      })),
    []
  );

  async function submitFilters(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());

    formData.entries().forEach(([key, value]) => {
      if (value.toString() === '') {
        params.delete(key);
        return;
      }

      params.set(key, value.toString());
    });

    params.set('page', '1');

    router.push(pathname + '?' + params.toString());

    onClose();
  }

  return (
    <Modal isOpen={isModalOpen} onClose={onClose}>
      <form action={submitFilters} className="flex min-w-80 space-y-3">
        <div className="flex-1">
          <h1 className={`${roboto.className} mb-5 text-2xl`}>Filtros</h1>

          <div className="w-full">
            <TextInput
              label="Nome"
              name="nome"
              className="mb-2"
              defaultValue={name}
            />

            <TextInput
              label="Cidade"
              name="cidade"
              className="mb-2"
              defaultValue={city}
            />

            <Dropdown
              label="Estado"
              name="estado"
              options={stateOptions}
              placeholder="Selecione um estado"
              defaultValue={state}
            />
          </div>

          <div className="mt-6 flex justify-end space-x-8">
            <Button className="w-24 justify-center">Buscar</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
