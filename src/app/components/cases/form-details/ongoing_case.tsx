"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { ONLY_DATE_PATTERN, parseDateTime, timeElapsed } from "@/app/libs/date";
import { changeStatus } from "@/app/services/cases";
import { addComment } from "@/app/services/comments";
import { CreateAttachment } from "@/app/types/attachments";
import { CaseFull, CaseStatus } from "@/app/types/case";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../../common/button";
import { Card } from "../../common/card";
import { FileUploaderGenericRef, GenericUploader } from "../../common/file-uploader";
import TargetDateModal from "../target-date-modal";

interface OnGoingStatusFormProps {
  crmCase: CaseFull;
}

export function OnGoingStatusForm({ crmCase }: OnGoingStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);

  const fileUploaderRef = useRef<FileUploaderGenericRef>(null);
  const [content, setContent] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [openTargetDateModal, setOpenTargetDateModal] = useState(false);

  const isBeforeTargetDate = new Date() < new Date(crmCase.target_date!!);

  const placeholderInfo = isBeforeTargetDate ? 'Adicione comentários ao caso' : 'Adicione informações sobre o caso e selecione imagens para anexar ao laudo, clicando no botão "Enviar para laudo"';

  async function onSubmit(_currentState: unknown, formData: FormData) {
    let attachments: CreateAttachment[] = [];

    if (fileUploaderRef.current?.length && fileUploaderRef.current?.length <= 0) {
      showSnackbar('é necessário ao menos 1 arquivo', 'error');
      return 
    }

    await fileUploaderRef.current?.submit().then(response => {
      attachments = response || [];
    });

    changeStatus(crmCase.case_id, CaseStatus.REPORT, formData, attachments).then(response => {
      if (!response.success) {
        if (response.unauthorized) {
          signOut();
        }
        showSnackbar(response.message, 'error');
        return;
      }

      showSnackbar(response.message, 'success');
      refresh();
    });
  }

  async function handleAddComment() {
    setLoadingComment(true);

    const formData = new FormData();
    formData.append("content", content);

    let attachments: CreateAttachment[] = [];

    await fileUploaderRef.current?.submit().then(response => {
      attachments = response || [];
    });

    addComment(crmCase.case_id, formData, attachments).then(response => {
      if (!response.success) {
        if (response.unauthorized) {
          signOut();
        }
        showSnackbar(response.message, 'error');
        return;
      }

      showSnackbar(response.message, 'success');
      refresh();
    }).finally(() => {
      setContent('');
    });

    setLoadingComment(false);
  }

  return (
    <Card title={isBeforeTargetDate ? "Aguardando data da visita" : "Caso em andamento"} titleSize="text-xl">
      <form action={dispatch} className="px-5 gap-4">
        {isBeforeTargetDate ? (
          <div className="flex items-center space-x-2 mb-2">
            <p className="text-sm font-medium text-gray-500">Data agendada:</p>
            <p className="text-sm font-medium text-gray-900 ml-4">{parseDateTime(crmCase.target_date || '', ONLY_DATE_PATTERN)}</p>
            <Button type="button" size="sm" onClick={() => setOpenTargetDateModal(true)}>Alterar data de visita</Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 mb-2">
            <p className="text-sm font-medium text-gray-500">Tempo decorrido:</p>
            <p className="text-sm font-medium text-gray-900">{timeElapsed(new Date(crmCase.target_date!!), new Date())}</p>
            <Button type="button" size="sm" onClick={() => setOpenTargetDateModal(true)}>Alterar data de visita</Button>
          </div>
        )}

        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="content">
            Informações adicionais
          </label>

          <textarea
            id="content"
            name="content"
            className="w-full h-32 p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder={placeholderInfo}
            value={content}
            onChange={event => setContent(event.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <GenericUploader ref={fileUploaderRef} minFiles={isBeforeTargetDate ? 0 : 1} maxFiles={10} />
        </div>

        <div className="flex gap-4">
          <Button type="button" onClick={handleAddComment} disabled={loadingComment}>Adicionar comentário</Button>
          {!isBeforeTargetDate && <Button type="submit" disabled={loadingComment}>Enviar para laudo</Button>}
        </div>
      </form>

      {openTargetDateModal && (
        <TargetDateModal
          caseId={crmCase.case_id}
          isOpen={openTargetDateModal}
          onClose={() => setOpenTargetDateModal(false)}
        />
      )}
    </Card>
  );
}
