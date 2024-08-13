import { useSnackbar } from "@/app/context/SnackbarProvider";
import { deleteContractor } from "@/app/services/contractors";
import { roboto } from "@/app/ui/fonts";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../common/button";
import Modal from "../common/modal";

interface DeleteContractorModalProps {
  isOpen: boolean;
  contractorID: string;
  onClose: () => void;
}

export function DeleteContractorModal({ isOpen, onClose, contractorID }: DeleteContractorModalProps) {
  const [state, dispatch] = useFormState(deleteContractor, null);
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
        <h1 className={`${roboto.className} my-5 mx-5 text-xl`}>
          Tem certeza que deseja desativar a seguradora?
        </h1>

        <input type="hidden" name="contractor_id" value={contractorID} />

        <div className="flex justify-center space-x-2">
          <Button type="submit" aria-disabled={pending}>Sim</Button>
          <Button onClick={onClose} aria-disabled={pending}>Não</Button>
        </div>
      </form>
    </Modal>
  );
}
