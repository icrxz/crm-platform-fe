import { useSnackbar } from "@/app/context/SnackbarProvider";
import { DocumentArrowDownIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { Button } from "../common/button";

interface DownloadReportButtonProps {
  caseID: string;
}

export function DownloadReportButton({ caseID }: DownloadReportButtonProps) {
  const { showSnackbar } = useSnackbar();
  const [loadingReport, setLoadingReport] = useState(false);

  function handleDownloadReport() {
    try {
      setLoadingReport(true);

      let downloadLink = window.document.createElement('a');
      downloadLink.href = `/api/report/${caseID}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (ex) {
      showSnackbar("Erro ao baixar o relatório", 'error');
    } finally {
      setLoadingReport(false);
    };
  }

  return (
    <a>
      <Button
        aria-disabled={loadingReport}
        className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-200"
        isLoading={loadingReport}
        type="button"
        onClick={handleDownloadReport}
        disabled={loadingReport}
      >
        {loadingReport ? <DocumentArrowDownIcon className="ml-auto h-5 w-5 text-green-100" /> : "Baixar laudo"}
      </Button>
    </a>
  );
}

