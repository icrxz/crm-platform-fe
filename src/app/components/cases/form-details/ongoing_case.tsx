"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { ONLY_DATE_PATTERN, parseDateTime, timeElapsed } from "@/app/libs/date";
import { changeStatus } from "@/app/services/cases";
import { addComment } from "@/app/services/comments";
import { CaseFull, CaseStatus } from "@/app/types/case";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface OnGoingStatusFormProps {
  crmCase: CaseFull;
}

export function OnGoingStatusForm({ crmCase }: OnGoingStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);
  const [content, setContent] = useState("");
  console.log('data da visita', crmCase.target_date);

  const isBeforeTargetDate = new Date() < new Date(crmCase.target_date!!);

  function onSubmit(_currentState: unknown, formData: FormData) {
    changeStatus(crmCase.case_id, CaseStatus.REPORT, formData).then(response => {
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

  function handleAddComment() {
    const formData = new FormData();
    formData.append("content", content);

    addComment(crmCase.case_id, formData).then(response => {
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

  return (
    <Card title={isBeforeTargetDate ? "Aguardando data da visita" : "Caso em andamento"} titleSize="text-xl">
      <form action={dispatch} className="px-5 gap-4">
        {isBeforeTargetDate ? (
          <div className="flex items-center space-x-2 mb-2">
            <p className="text-sm font-medium text-gray-500">Data agendada:</p>
            <p className="text-sm font-medium text-gray-900">{parseDateTime(crmCase.target_date || '', ONLY_DATE_PATTERN)}</p>
          </div>
        ) : (
          <div className="flex items-center space-x-2 mb-2">
            <p className="text-sm font-medium text-gray-500">Tempo decorrido:</p>
            <p className="text-sm font-medium text-gray-900">{timeElapsed(new Date(crmCase.updated_at), new Date())}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="content">
            Informações adicionais
          </label>

          <textarea
            id="content"
            name="content"
            className="w-full h-32 p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Adicione informações adicionais sobre o caso..."
            value={content}
            onChange={event => setContent(event.target.value)}
            required
          />
        </div>

        <div className="flex gap-4">
          <Button type="button" onClick={handleAddComment}>Enviar</Button>
          <Button type="submit">Finalizar</Button>
        </div>
      </form>
    </Card>
  );
}
