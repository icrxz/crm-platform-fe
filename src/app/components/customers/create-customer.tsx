import { signOut } from "next-auth/react";
import Modal from "../common/modal";
import { createCustomer } from "../../services/customers";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import CustomerForm from "./customer-form";
import { useRouter } from "next/navigation";
import { ServiceResponse } from "@/app/types/service";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCustomerModal({ isOpen, onClose }: CreateCustomerModalProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [state, setState] = useState<ServiceResponse<any> | null>(null);

  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state?.success) {
      showSnackbar(state.message, 'success')
      refresh();
      onClose();
    } else {
      if (state?.unauthorized) {
        signOut();
      }
      setErrorMessage(state?.message || "")
    }
  }, [state])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <CustomerForm onSubmit={createCustomer} onClose={onClose} submitState={setState} />

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
    </Modal >
  )
}