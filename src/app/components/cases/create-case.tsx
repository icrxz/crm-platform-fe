import { useSnackbar } from '@/app/context/SnackbarProvider';
import { createCase } from '@/app/services/cases';
import { CreateCaseResponse } from '@/app/types/case';
import { ServiceResponse } from '@/app/types/service';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorMessage } from '../common/error-message';
import Modal from '../common/modal';
import CaseForm from './case-form';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCaseModal({
  isOpen,
  onClose,
}: CreateCaseModalProps) {
  const [state, setState] =
    useState<ServiceResponse<CreateCaseResponse> | null>(null);
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();

  const errorMessage = state && !state.success ? state.message || '' : '';
  const createdUser = state?.data?.customer_id || null;

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

  const handleCreateCase = async (_currentState: any, formData: FormData) => {
    if (createdUser && !formData.get('customer_id')) {
      formData.set('customer_id', createdUser);
    }

    return await createCase(_currentState, formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <CaseForm
          onClose={onClose}
          submitState={setState}
          onSubmit={handleCreateCase}
        />

        {errorMessage && <ErrorMessage message={errorMessage} />}
      </div>
    </Modal>
  );
}
