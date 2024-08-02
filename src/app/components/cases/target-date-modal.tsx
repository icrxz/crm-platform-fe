import { useSnackbar } from "@/app/context/SnackbarProvider";
import { createCase } from "@/app/services/cases";
import { CreateCaseResponse } from "@/app/types/case";
import { ServiceResponse } from "@/app/types/service";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorMessage } from "../common/error-message";
import Modal from "../common/modal";
import CaseForm from "./case-form";
import { update } from "@/app/services/cases/update";
import { useFormState } from "react-dom";
import { InputMask } from "@react-input/mask";

interface TargetDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

export default function TargetDateModal({ isOpen, onClose, caseId }: TargetDateModalProps) {
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();
  const [_, dispatch] = useFormState(updateTargetDate, null);

  const [errorMessage, setErrorMessage] = useState("");
  const [state, setState] = useState<ServiceResponse<CreateCaseResponse> | null>(null);
  const [createdUser, setCreatedUser] = useState<string | null>(null);

  function updateTargetDate(_currentState: any, formData: FormData) {
    if (createdUser && !formData.get("customer_id")) {
      formData.set("customer_id", createdUser);
    }

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
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <form action={dispatch} className="space-y-3">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="target_date">
              Data de visita
            </label>

            <InputMask
              type="datetime-local"
              id="target_date"
              name="target_date"
              className="w-full h-10 p-2 border border-gray-300 rounded-md"
              required
              mask="__/__/____"
              replacement={{ _: /\d/ }}
            />
          </div>
        </form>

        {errorMessage && (
          <ErrorMessage message={errorMessage} />
        )}
      </div>
    </Modal>
  );
}
