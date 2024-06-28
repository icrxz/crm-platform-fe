import { useSnackbar } from "@/app/context/SnackbarProvider";
import { deleteCustomer } from "@/app/services/customers";
import { lusitana } from "@/app/ui/fonts";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../common/button";
import Modal from "../common/modal";

interface DeleteCustomerModalProps {
  isOpen: boolean;
  customerID: string;
  onClose: () => void;
}

export function DeleteCustomerModal({ isOpen, onClose, customerID }: DeleteCustomerModalProps) {
  const [state, dispatch] = useFormState(deleteCustomer, null);
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
    } else {
      if (state?.unauthorized) {
        signOut();
      }
      showSnackbar(state?.message || "", 'error');
    }
  }, [state]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form action={dispatch} className="space-y-3">
        <h1 className={`${lusitana.className} my-5 mx-5 text-xl`}>
          Tem certeza que deseja desativar o cliente?
        </h1>

        <input type="hidden" name="customer_id" value={customerID} />

        <div className="flex justify-center space-x-2">
          <Button type="submit" aria-disabled={pending}>Sim</Button>
          <Button onClick={onClose} aria-disabled={pending}>Não</Button>
        </div>
      </form>
    </Modal>
  );
}
