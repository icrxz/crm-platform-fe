"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { changeStatus } from "@/app/services/cases";
import { CaseFull, CaseStatus } from "@/app/types/case";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../common/button";
import { Card } from "../../common/card";
import { useFormState } from "react-dom";

interface ReportStatusFormProps {
  crmCase: CaseFull;
}

export function ReportStatusForm({ crmCase }: ReportStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useFormState(onSubmit, null);

  const [loadingStatus, setLoadingStatus] = useState(false);

  async function onSubmit(_currentState: unknown, formData: FormData) {
    setLoadingStatus(true);

    changeStatus(crmCase.case_id, CaseStatus.PAYMENT, formData).then((response) => {
      if (!response.success) {
        if (response.unauthorized) {
          signOut();
        }
        showSnackbar(response.message, 'error');
        return;
      }
      showSnackbar(response.message, 'success');
      refresh();
    }).catch((ex) => {
      showSnackbar(ex, 'error');
    }).finally(() => {
      setLoadingStatus(false);
    });
  }

  return (
    <Card title="Gerar laudo" titleSize="text-xl">
      <form action={dispatch} className="px-5 gap-4">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="content">
            Conclusão do atendimento
          </label>

          <textarea
            id="content"
            name="content"
            className="w-full h-32 p-2 border border-gray-300 rounded-md"
            rows={2}
            placeholder="Essa descrição será a conclusão do laudo"
            required
          />
        </div>

        <div className="flex gap-8">
          <Button type="submit" isLoading={loadingStatus}>Concluir</Button>
        </div>
      </form>
    </Card>
  );
}
