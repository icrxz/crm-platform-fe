'use client';
import { fetchContractors } from '@/app/services/contractors';
import { roboto } from '@/app/ui/fonts';
import { Select, SelectItem, Selection } from '@heroui/react';
import { useEffect, useState } from 'react';
import { CaseFilters } from '../../libs/case-filters-storage';
import { CaseStatus, caseStatusMap } from '../../types/case';
import { Contractor } from '../../types/contractor';
import { UserRole } from '../../types/user';
import { adminRoles } from '../../utils/roles';
import { onlyAdminStatuses } from '../../utils/case_status';
import { Button } from '../common/button';
import Modal from '../common/modal';

interface FilterModalProps {
  isModalOpen: boolean;
  onClose(): void;
  onApply(filters: CaseFilters): void;
  initialStatus: string[];
  initialContractorId: string[];
  userRole?: UserRole;
}

export function FilterModal({
  onClose,
  isModalOpen,
  onApply,
  initialStatus,
  initialContractorId,
  userRole,
}: FilterModalProps) {
  const isAdmin = userRole !== undefined && adminRoles.includes(userRole);
  const availableStatuses = isAdmin
    ? Object.values(CaseStatus)
    : Object.values(CaseStatus).filter(
        (status) => !onlyAdminStatuses.includes(status)
      );
  const [status, setStatus] = useState<Set<string>>(new Set(initialStatus));
  const [contractorId, setContractorId] = useState<Set<string>>(
    new Set(initialContractorId)
  );
  const [contractors, setContractors] = useState<Contractor[]>([]);

  useEffect(() => {
    fetchContractors('active=true', 1, 1000).then((res) => {
      setContractors(res.data?.result || []);
    });
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onApply({
      status: Array.from(status),
      contractorId: Array.from(contractorId),
    });
  }

  function toStringSet(keys: Selection): Set<string> {
    return keys === 'all' ? new Set() : new Set(Array.from(keys, String));
  }

  function renderSelectionCount(count: number, emptyLabel: string) {
    if (count === 0) return emptyLabel;
    return count === 1 ? '1 selecionado' : `${count} selecionados`;
  }

  return (
    <Modal isOpen={isModalOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex w-80 space-y-3">
        <div className="flex-1">
          <h1 className={`${roboto.className} mb-5 text-2xl`}>Filtros</h1>

          <div className="flex w-full flex-col gap-4">
            <Select
              label="Estado"
              placeholder="Todos"
              selectionMode="multiple"
              selectedKeys={status}
              onSelectionChange={(keys) => setStatus(toStringSet(keys))}
              renderValue={() => renderSelectionCount(status.size, 'Todos')}
              classNames={{ trigger: 'min-h-10 h-10' }}
            >
              {availableStatuses.map((value) => (
                <SelectItem key={value}>{caseStatusMap[value]}</SelectItem>
              ))}
            </Select>

            <Select
              label="Seguradora"
              placeholder="Todas"
              selectionMode="multiple"
              selectedKeys={contractorId}
              onSelectionChange={(keys) => setContractorId(toStringSet(keys))}
              renderValue={() =>
                renderSelectionCount(contractorId.size, 'Todas')
              }
              classNames={{ trigger: 'min-h-10 h-10' }}
            >
              {contractors.map((contractor) => (
                <SelectItem key={contractor.contractor_id}>
                  {contractor.company_name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="mt-6 flex justify-end space-x-8">
            <Button type="submit" className="w-24 justify-center">
              Buscar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
