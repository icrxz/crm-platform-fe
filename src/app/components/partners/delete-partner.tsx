import { useSnackbar } from "@/app/context/SnackbarProvider";
import { deletePartner } from "@/app/services/partners";
import { roboto } from "@/app/ui/fonts";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../common/button";
import Modal from "../common/modal";

interface DeletePartnerModalProps {
  isOpen: boolean;
  partnerID: string;
  onClose: () => void;
}

export function DeletePartnerModal({ isOpen, onClose, partnerID }: DeletePartnerModalProps) {
  const [state, dispatch] = useFormState(deletePartner, null);
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
          Tem certeza que deseja desativar o técnico?
        </h1>

        <input type="hidden" name="partner_id" value={partnerID} />

        <div className="flex justify-center space-x-2">
          <Button type="submit" aria-disabled={pending}>Sim</Button>
          <Button onClick={onClose} aria-disabled={pending}>Não</Button>
        </div>
      </form>
    </Modal>
  );
}
