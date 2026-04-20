'use client';
import { useSnackbar } from '@/app/context/SnackbarProvider';
import { resetStatus } from '@/app/services/cases';
import { UserRole } from '@/app/types/user';
import { roboto } from '@/app/ui/fonts';
import { adminRoles } from '@/app/utils/roles';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../../common/button';
import Modal from '../../common/modal';

interface ResetCaseButtonProps {
  caseId: string;
  userRole: UserRole;
}

export function ResetCaseButton({ caseId, userRole }: ResetCaseButtonProps) {
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdminRole = adminRoles.includes(userRole);

  async function handleResetCase() {
    setLoading(true);

    try {
      await resetStatus(caseId)
        .then((response) => {
          if (!response.success) {
            if (response.unauthorized) {
              signOut({ callbackUrl: '/login' });
            }
            showSnackbar(response.message, 'error');
            return;
          }

          showSnackbar(response.message, 'success');
          refresh();
        })
        .catch((error) => {
          showSnackbar(error, 'error');
        });
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  }

  function onClose() {
    setShowConfirmation(false);
  }

  return (
    <>
      {isAdminRole && (
        <Button
          onClick={() => setShowConfirmation(true)}
          color="warning"
          disabled={loading}
          isLoading={loading}
          size="md"
        >
          Resetar caso
        </Button>
      )}

      {showConfirmation && (
        <Modal isOpen={showConfirmation} onClose={onClose}>
          <h1 className={`${roboto.className} mx-5 mb-2 mt-3 text-xl`}>
            Tem certeza que deseja resetar o caso?
          </h1>

          <p className={`${roboto.className} text-md mx-5 mb-5`}>
            Esta ação irá remover todas as informações do caso e reiniciar o
            fluxo.
          </p>

          <div className="flex justify-center space-x-8">
            <Button
              onClick={() => handleResetCase()}
              color="success"
              disabled={loading}
              isLoading={loading}
              size="md"
            >
              Sim
            </Button>

            <Button
              onClick={() => onClose()}
              color="error"
              disabled={loading}
              isLoading={loading}
              size="md"
            >
              Cancelar
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
