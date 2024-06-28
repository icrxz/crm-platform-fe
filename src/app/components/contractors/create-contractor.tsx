import { useSnackbar } from "@/app/context/SnackbarProvider";
import { ServiceResponse } from "@/app/types/service";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "../../components/common/modal";
import { createContractor } from "../../services/contractors";
import { ContractorForm } from "./contractor-form";

interface CreateContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateContractorModal({ isOpen, onClose }: CreateContractorModalProps) {
  const [state, setState] = useState<ServiceResponse<any> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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
    }
  }, [state]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <ContractorForm onClose={onClose} onSubmit={createContractor} submitState={setState} />

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
