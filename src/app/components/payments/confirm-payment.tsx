import { useSnackbar } from "@/app/context/SnackbarProvider";
import { changeStatus } from "@/app/services/cases";
import { CaseStatus } from "@/app/types/case";
import { lusitana } from "@/app/ui/fonts";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../common/button";
import Modal from "../common/modal";

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  caseId: string;
  onClose: () => void;
}

export function ConfirmPaymentModal({ isOpen, onClose, caseId }: ConfirmPaymentModalProps) {
  const [_, dispatch] = useFormState(onSubmit, null);
  const { pending } = useFormStatus();
  const { showSnackbar } = useSnackbar();
  const { refresh } = useRouter();

  function onSubmit() {
    changeStatus(caseId, CaseStatus.CLOSED).then(response => {
      if (!response.success) {
        if (response.unauthorized) {
          signOut();
        }
        showSnackbar(response.message, 'error');
        return;
      }
      showSnackbar(response.message, 'success');
      refresh();
      onClose();
    }).catch((ex) => {
      showSnackbar(ex, 'error');
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form action={dispatch} className="space-y-3">
        <h1 className={`${lusitana.className} my-5 mx-5 text-xl`}>
          Deseja confirmar o pagamento do caso?
        </h1>

        <div className="flex justify-center space-x-2">
          <Button type="submit" aria-disabled={pending} disabled={pending}>Sim</Button>
          <Button onClick={onClose} aria-disabled={pending} disabled={pending}>Não</Button>
        </div>
      </form>
    </Modal>
  );
}
