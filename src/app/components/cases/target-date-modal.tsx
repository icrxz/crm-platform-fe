import { useSnackbar } from "@/app/context/SnackbarProvider";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorMessage } from "../common/error-message";
import Modal from "../common/modal";
import { update } from "@/app/services/cases/update";
import { useFormState } from "react-dom";
import { InputMask } from "@react-input/mask";
import { Button } from "../common/button";

interface TargetDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  originalDate?: string;
}

export default function TargetDateModal({ isOpen, onClose, caseId, originalDate }: TargetDateModalProps) {
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();
  const [_, dispatch] = useFormState(updateTargetDate, null);

  const [errorMessage, setErrorMessage] = useState("");

  function updateTargetDate(_currentState: any, formData: FormData) {
    update(caseId, formData).then(response => {
      if (!response.success) {
        if (response.unauthorized) {
          signOut();
        }
        setErrorMessage(response.message || "");
        return;
      }

      showSnackbar(response.message, 'success');
      refresh();
      onClose();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <form action={dispatch} className="space-y-3">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="target_date">
              Nova Data de Visita
            </label>

            <InputMask
              type="datetime-local"
              id="target_date"
              name="target_date"
              className="w-full h-10 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <Button>Alterar</Button>
          </div>
        </form>

        {errorMessage && (
          <ErrorMessage message={errorMessage} />
        )}
      </div>
    </Modal>
  );
}
