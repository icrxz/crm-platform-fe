"use client";
import { useSnackbar } from "@/app/context/SnackbarProvider";
import { changeStatus } from "@/app/services/cases";
import { CaseFull, CaseStatus } from "@/app/types/case";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../../common/button";
import { Card } from "../../common/card";
import { DownloadReportButton } from "../download-report-button";

interface ReportStatusFormProps {
  crmCase: CaseFull;
}

export function ReportStatusForm({ crmCase }: ReportStatusFormProps) {
  const { refresh } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [loadingStatus, setLoadingStatus] = useState(false);

  function handleConcludeCase() {
    setLoadingStatus(true);
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
      setLoadingStatus(false);
    });
  }

  return (
    <Card title="Gerar laudo" titleSize="text-xl">
      <div className="flex ml-4 gap-8">
        <DownloadReportButton caseID={crmCase.case_id} />

        <Button type="button" disabled={loadingStatus} onClick={handleConcludeCase}>Concluir</Button>
      </div>
    </Card>
  );
}
