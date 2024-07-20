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

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCaseModal({ isOpen, onClose }: CreateCaseModalProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [state, setState] = useState<ServiceResponse<CreateCaseResponse> | null>(null);
  const [createdUser, setCreatedUser] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state?.success) {
      showSnackbar(state.message, 'success');
      refresh();
      onClose();
    } else {
      if (state?.unauthorized) {
        signOut();
      }
      setErrorMessage(state?.message || "");

      if (state?.data?.customer_id) {
        setCreatedUser(state.data.customer_id);
      }
    }
  }, [state]);

  const handleCreateCase = async (_currentState: any, formData: FormData) => {
    if (createdUser && !formData.get("customer_id")) {
      formData.set("customer_id", createdUser);
    }

    return await createCase(_currentState, formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <CaseForm onClose={onClose} submitState={setState} onSubmit={handleCreateCase} />

        {errorMessage && (
          <ErrorMessage message={errorMessage} />
        )}
      </div>
    </Modal>
  );
}
