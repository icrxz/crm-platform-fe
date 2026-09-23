'use client';
import { resetStatus } from '@/app/services/cases';
import { UserRole } from '@/app/types/user';
import { adminRoles } from '@/app/utils/roles';
import { useState } from 'react';
import { Button } from '../../common/button';
import { ConfirmModal } from '../../common/confirm-modal';

interface ResetCaseButtonProps {
  caseId: string;
  userRole: UserRole;
}

export function ResetCaseButton({ caseId, userRole }: ResetCaseButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isAdminRole = adminRoles.includes(userRole);

  return (
    <>
      {isAdminRole && (
        <Button
          onClick={() => setShowConfirmation(true)}
          color="warning"
          size="md"
        >
          Resetar caso
        </Button>
      )}

      {/* Mounted only while open, like the other ConfirmModal callers: closing
          it discards the useActionState result instead of leaving a settled
          state behind for the modal's effect to keep reacting to. */}
      {showConfirmation && (
        <ConfirmModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          title="Tem certeza que deseja resetar o caso?"
          description="Esta ação irá remover todas as informações do caso e reiniciar o fluxo."
          action={() => resetStatus(caseId)}
          confirmColor="success"
          cancelColor="error"
          cancelLabel="Cancelar"
        />
      )}
    </>
  );
}
