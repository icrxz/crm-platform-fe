"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { changeStatus } from "@/app/services/cases";
import { CreateAttachment } from "@/app/types/attachments";
import { CaseFull, CaseStatus } from "@/app/types/case";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../../common/button";
import { Card } from "../../common/card";
import { ErrorMessage } from "../../common/error-message";
import { FileUploaderGenericRef, GenericUploader } from "../../common/file-uploader";

interface CustomerInfoStatusFormProps {
  crmCase: CaseFull;
}

export function CustomerInfoStatusForm({ crmCase }: CustomerInfoStatusFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const fileUploaderRef = useRef<FileUploaderGenericRef>(null);

  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);

  async function onSubmit(_: unknown, formData: FormData) {
    let attachments: CreateAttachment[] = [];

    await fileUploaderRef.current?.submit().then(response => {
      attachments = response || [];
    });

    changeStatus(crmCase.case_id, CaseStatus.WAITING_PARTNER, formData, attachments).then(response => {
      if (!response.success) {
        if (response.unauthorized) {
          signOut();
        }
        setErrorMessage(response.message || "");
        return;
      }

      showSnackbar(response.message, 'success');
      refresh();
    }).catch(error => {
      setErrorMessage(error);
    });
  }

  return (
    <Card title="Detalhes" titleSize="text-xl">
      <form action={dispatch} className="px-5">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="content">
            Descrição do caso
          </label>

          <textarea
            id="content"
            name="content"
            className="w-full h-32 p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Digite a descrição do caso"
            required
          />
        </div>

        <div className="mb-4">
          <GenericUploader ref={fileUploaderRef} minFiles={1} maxFiles={5} />
        </div>

        {errorMessage && (
          <ErrorMessage message={errorMessage} />
        )}

        <Button>Enviar</Button>
      </form>
    </Card>
  );
}
