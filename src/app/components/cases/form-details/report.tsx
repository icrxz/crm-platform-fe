'use client';
import { useSnackbar } from '@/app/context/SnackbarProvider';
import { changeStatus } from '@/app/services/cases';
import { CaseFull, CaseStatus } from '@/app/types/case';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../../common/button';
import { Card } from '../../common/card';
import { useActionState } from 'react';

interface ReportStatusFormProps {
  crmCase: CaseFull;
}

export function ReportStatusForm({ crmCase }: ReportStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [_, dispatch] = useActionState(onSubmit, null);

  const [loadingStatus, setLoadingStatus] = useState(false);

  async function onSubmit(_currentState: unknown, formData: FormData) {
    setLoadingStatus(true);

    changeStatus(crmCase.case_id, CaseStatus.PAYMENT, formData)
      .then((response) => {
        if (!response.success) {
          if (response.unauthorized) {
            signOut({ callbackUrl: '/login' });
          }
          showSnackbar(response.message, 'error');
          return;
        }
        showSnackbar(response.message, 'success');
        refresh();
      })
      .catch((ex) => {
        showSnackbar(ex, 'error');
      })
      .finally(() => {
        setLoadingStatus(false);
      });
  }

  return (
    <Card title="Gerar laudo" titleSize="xl">
      <form action={dispatch} className="gap-4 px-5">
        <div className="mb-2">
          <label
            className="mb-2 block text-sm font-medium text-gray-700"
            htmlFor="content"
          >
            Conclusão do atendimento
          </label>

          <textarea
            id="content"
            name="content"
            className="h-32 w-full rounded-md border border-gray-300 p-2"
            rows={2}
            placeholder="Essa descrição será a conclusão do laudo"
            required
          />
        </div>

        <div className="flex gap-8">
          <Button type="submit" isLoading={loadingStatus}>
            Concluir
          </Button>
        </div>
      </form>
    </Card>
  );
}
