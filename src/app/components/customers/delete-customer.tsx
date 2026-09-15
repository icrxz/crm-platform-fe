import { deleteCustomer } from '@/app/services/customers';
import { ConfirmModal } from '../common/confirm-modal';

interface DeleteCustomerModalProps {
  isOpen: boolean;
  customerID: string;
  onClose: () => void;
}

export function DeleteCustomerModal({
  isOpen,
  onClose,
  customerID,
}: DeleteCustomerModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tem certeza que deseja desativar o cliente?"
      action={deleteCustomer}
      hiddenFields={{ customer_id: customerID }}
    />
  );
}
