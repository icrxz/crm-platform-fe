import { useSnackbar } from "@/app/context/SnackbarProvider";
import { changeStatus } from "@/app/services/cases";
import { CreateAttachment } from "@/app/types/attachments";
import { CaseStatus } from "@/app/types/case";
import { lusitana } from "@/app/ui/fonts";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../common/button";
import { ErrorMessage } from "../common/error-message";
import { FileUploaderGenericRef, GenericUploader } from "../common/file-uploader";
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
  const fileUploaderRef = useRef<FileUploaderGenericRef>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(_: unknown, formData: FormData) {
    let attachments: CreateAttachment[] = [];
    await fileUploaderRef.current?.submit().then(response => {
      attachments = response || [];
    });

    if (attachments.length === 0) {
      setErrorMessage("Por favor, adicione pelo menos um arquivo");
      return;
    }

    formData.set("content", `pagamento realizado no dia ${new Date().toLocaleDateString()}`);

    changeStatus(caseId, CaseStatus.CLOSED, formData, attachments).then(response => {
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

        <div className="flex flex-col mb-4 items-center">
          <label className="mb-1">Adicione o comprovante do pagamento</label>
          <GenericUploader ref={fileUploaderRef} minFiles={1} maxFiles={1} />
        </div>

        {errorMessage && (
          <ErrorMessage message={errorMessage} />
        )}

        <div className="flex justify-center space-x-2">
          <Button type="submit" aria-disabled={pending} disabled={pending}>Sim</Button>
          <Button onClick={onClose} aria-disabled={pending} disabled={pending}>Não</Button>
        </div>
      </form>
    </Modal>
  );
}
