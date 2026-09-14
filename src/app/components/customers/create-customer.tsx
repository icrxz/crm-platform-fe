import { useSnackbar } from '@/app/context/SnackbarProvider';
import { ServiceResponse } from '@/app/types/service';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createCustomer } from '../../services/customers';
import Modal from '../common/modal';
import CustomerForm from './customer-form';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCustomerModal({
  isOpen,
  onClose,
}: CreateCustomerModalProps) {
  const [state, setState] = useState<ServiceResponse<any> | null>(null);

  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();

  const errorMessage = state && !state.success ? state.message || '' : '';

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.success) {
      showSnackbar(state.message, 'success');
      refresh();
      onClose();
    } else if (state.unauthorized) {
      signOut({ callbackUrl: '/login' });
    }
  }, [state, showSnackbar, refresh, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <CustomerForm
          onSubmit={createCustomer}
          onClose={onClose}
          submitState={setState}
        />

        {errorMessage && (
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">{errorMessage}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
