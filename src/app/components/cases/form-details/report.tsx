"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { changeStatus } from "@/app/services/cases";
import { CaseFull, CaseStatus } from "@/app/types/case";
import { DocumentArrowDownIcon } from "@heroicons/react/16/solid";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../common/button";
import { Card } from "../../common/card";

interface ReportStatusFormProps {
  crmCase: CaseFull;
}

export function ReportStatusForm({ crmCase }: ReportStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [loadingReport, setLoadingReport] = useState(false);

  function handleDownloadReport() {
    try {
      setLoadingReport(true);

      let downloadLink = window.document.createElement('a');
      downloadLink.href = `/api/report/${crmCase.case_id}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (ex) {
      showSnackbar("Erro ao baixar o relatório", 'error');
    } finally {
      setLoadingReport(false);
    };
  }

  function handleConcludeCase() {
    setLoadingReport(true);
    changeStatus(crmCase.case_id, CaseStatus.PAYMENT).then((response) => {
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
      setLoadingReport(false);
    });
  }

  return (
    <Card title="Gerar laudo" titleSize="text-xl">
      <div className="flex ml-4 gap-8">
        <a>
          <Button
            type="button"
            onClick={handleDownloadReport}
            disabled={loadingReport}
          >
            {loadingReport ? <DocumentArrowDownIcon className="ml-auto h-5 w-5 text-green-100" /> : "Baixar laudo"}
          </Button>
        </a>

        <Button type="button" disabled={loadingReport} onClick={handleConcludeCase}>Concluir</Button>
      </div>
    </Card>
  );
}
