"use client";
import { roboto } from "@/app/ui/fonts";
import Modal from "../common/modal";
import { Button } from "../common/button";
import { TextInput } from "../common/text-input/text-input";
import { Dropdown } from "../common/dropdown/dropdown";
import { CaseStatus, caseStatusMap } from '../../types/case';

interface FilterModalProps {
  isModalOpen: boolean;
  onClose(): void;
}

export function FilterModal({ onClose, isModalOpen }: FilterModalProps) {
  const statusOptions = Object.values(CaseStatus).map((status) => ({
    id: status,
    value: status,
    label: caseStatusMap[status],
  }));

  async function submitFilters(formData: FormData) {
    const x = formData.entries().forEach(([key, value]) => console.log(key, value));
  }

  return (
    <Modal isOpen={isModalOpen} onClose={onClose}>
      <form action={submitFilters} className="flex space-y-3 min-w-80">
        <div className="flex-1">
          <h1 className={`${roboto.className} mb-5 text-2xl`}>
            Filtros
          </h1>

          <div className="w-full">
            <Dropdown label="Status" name="sinistro" className="mb-2" options={statusOptions} />

            <TextInput label="Cliente" name="cliente" className="mb-2" />

            <TextInput label="Técnico" name="tecnico" />
          </div>

          <div className="flex space-x-8 mt-6 justify-end">
            <Button className="w-24 justify-center">
              Buscar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}