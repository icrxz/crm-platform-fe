import { deleteContractor } from '@/app/services/contractors';
import { ConfirmModal } from '../common/confirm-modal';

interface DeleteContractorModalProps {
  isOpen: boolean;
  contractorID: string;
  onClose: () => void;
}

export function DeleteContractorModal({
  isOpen,
  onClose,
  contractorID,
}: DeleteContractorModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tem certeza que deseja desativar a seguradora?"
      action={deleteContractor}
      hiddenFields={{ contractor_id: contractorID }}
    />
  );
}
