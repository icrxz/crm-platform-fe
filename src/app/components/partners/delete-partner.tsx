import { deletePartner } from '@/app/services/partners';
import { ConfirmModal } from '../common/confirm-modal';

interface DeletePartnerModalProps {
  isOpen: boolean;
  partnerID: string;
  onClose: () => void;
}

export function DeletePartnerModal({
  isOpen,
  onClose,
  partnerID,
}: DeletePartnerModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tem certeza que deseja desativar o técnico?"
      action={deletePartner}
      hiddenFields={{ partner_id: partnerID }}
    />
  );
}
