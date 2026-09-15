'use client';
import { useSnackbar } from '@/app/context/SnackbarProvider';
import { ServiceResponse } from '@/app/types/service';
import { roboto } from '@/app/ui/fonts';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '../button';
import Modal from '../modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  action: (
    currentState: unknown,
    formData: FormData
  ) => Promise<ServiceResponse<unknown>>;
  hiddenFields?: Record<string, string>;
  confirmLabel?: string;
  cancelLabel?: string;
  onSuccess?: () => void;
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  action,
  hiddenFields,
  confirmLabel = 'Sim',
  cancelLabel = 'Não',
  onSuccess,
}: ConfirmModalProps) {
  const [state, dispatch] = useActionState(action, null);
  const { pending } = useFormStatus();
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.success) {
      showSnackbar(state.message, 'success');
      refresh();
      onClose();
      onSuccess?.();
    } else {
      if (state.unauthorized) {
        signOut({ callbackUrl: '/login' });
      }
      showSnackbar(state.message || '', 'error');
    }
  }, [state, showSnackbar, refresh, onClose, onSuccess]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form action={dispatch} className="space-y-3">
        <h1 className={`${roboto.className} mx-5 my-5 text-xl`}>{title}</h1>

        {hiddenFields &&
          Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}

        <div className="flex justify-center space-x-2">
          <Button type="submit" isLoading={pending} aria-disabled={pending}>
            {confirmLabel}
          </Button>
          <Button onClick={onClose} isLoading={pending} aria-disabled={pending}>
            {cancelLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
