'use client';
import { useSnackbar } from '@/app/context/SnackbarProvider';
import { ServiceResponse } from '@/app/types/service';
import { roboto } from '@/app/ui/fonts';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '../button';
import Modal from '../modal';

type ConfirmModalColor = 'success' | 'error' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  action: (
    currentState: unknown,
    formData: FormData
  ) => Promise<ServiceResponse<unknown>>;
  hiddenFields?: Record<string, string>;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: ConfirmModalColor;
  cancelColor?: ConfirmModalColor;
  onSuccess?: () => void;
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  action,
  hiddenFields,
  confirmLabel = 'Sim',
  cancelLabel = 'Não',
  confirmColor = 'info',
  cancelColor = 'info',
  onSuccess,
}: ConfirmModalProps) {
  const [state, dispatch] = useActionState(action, null);
  const { pending } = useFormStatus();
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();

  // The effect below depends on callbacks owned by the caller (onClose,
  // onSuccess) and by the snackbar context, so a caller that rebuilds them
  // each render would re-fire it for a state that was already handled —
  // replaying refresh() and the snackbar. Each settled state is handled once.
  const handledStateRef = useRef<typeof state>(null);

  useEffect(() => {
    if (!state || handledStateRef.current === state) {
      return;
    }
    handledStateRef.current = state;

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

        {description && (
          <p className={`${roboto.className} text-md mx-5 mb-5`}>
            {description}
          </p>
        )}

        {hiddenFields &&
          Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}

        <div className="flex justify-center space-x-2">
          <Button
            type="submit"
            color={confirmColor}
            scheme="quiet"
            isLoading={pending}
            aria-disabled={pending}
          >
            {confirmLabel}
          </Button>
          <Button
            onClick={onClose}
            color={cancelColor}
            scheme="loud"
            isLoading={pending}
            aria-disabled={pending}
          >
            {cancelLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
