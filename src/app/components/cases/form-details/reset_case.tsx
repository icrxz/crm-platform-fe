"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { resetStatus } from "@/app/services/cases";
import { UserRole } from "@/app/types/user";
import { roboto } from "@/app/ui/fonts";
import { adminRoles } from "@/app/utils/roles";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../common/button";
import Modal from "../../common/modal";

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

  function handleResetCase() {
    setLoading(true);

    try {
      resetStatus(caseId).then(response => {
        if (!response.success) {
          if (response.unauthorized) {
            signOut();
          }
          showSnackbar(response.message, 'error');
          return;
        }

        showSnackbar(response.message, 'success');
        refresh();
      }).catch((error) => {
        showSnackbar(error, 'error');
      });
    } finally {
      setLoading(false);
    }
  }

  function onClose() {
    setShowConfirmation(false);
  }

  return (
    <>
      {isAdminRole && <Button
        onClick={() => setShowConfirmation(true)}
        color="error"
        disabled={loading}
        isLoading={loading}
      >
        Resetar caso
      </Button>}

      {showConfirmation && (
        <Modal isOpen={showConfirmation} onClose={onClose}>
          <h1 className={`${roboto.className} my-5 mx-5 text-xl`}>
            Tem certeza que deseja resetar o caso?
          </h1>

          <div className="flex justify-center space-x-8">
            <Button
              onClick={() => handleResetCase()}
              color="success"
              disabled={loading}
              isLoading={loading}
            >
              Sim
            </Button>

            <Button
              onClick={() => onClose()}
              color="error"
              disabled={loading}
              isLoading={loading}
            >
              Cancelar
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}