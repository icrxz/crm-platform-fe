"use server";

import { parseToCurrency } from "@/app/libs/parser";
import { CaseFull } from "@/app/types/case";
import { Transaction, TransactionType } from "@/app/types/transaction";
import { roboto } from "@/app/ui/fonts";
import { Card } from "../common/card";

interface ControlPanelSummaryProps {
  cases: CaseFull[];
}

interface PanelSummaryData {
  totalLabor: number;
  totalDisplacement: number;
  totalParts: number;
  totalIncomingLabor: number;
  totalIncomingDisplacement: number;
  totalIncomingParts: number;
  totalIncoming: number;
  totalOutgoing: number;
}

async function getData(cases: CaseFull[]): Promise<PanelSummaryData> {
  let totalLabor = 0;
  let totalDisplacement = 0;
  let totalParts = 0;
  let totalIncomingLabor = 0;
  let totalIncomingDisplacement = 0;
  let totalIncomingParts = 0;
  let totalIncoming = 0;
  let totalOutgoing = 0;

  cases.forEach((crmCase) => {
    crmCase.transactions?.forEach((transaction) => {
      if (transaction.type === TransactionType.INCOMING) {
        totalIncoming += transaction.value;

        switch (transaction.description) {
          case 'Cobrado seguradora':
            totalIncomingLabor += transaction.value;
            break;
          case 'Deslocamento':
            totalIncomingDisplacement += transaction.value;
            break;
          case 'Peças':
            totalIncomingParts += transaction.value;
            break;
        }
      } else if (transaction.type === TransactionType.OUTGOING) {
        totalOutgoing += transaction.value;

        switch (transaction.description) {
          case 'MO':
            totalLabor += transaction.value;
            break;
          case 'Deslocamento Técnico':
            totalDisplacement += transaction.value;
            break;
          case 'Peças técnico':
            totalParts += transaction.value;
            break;
        }
      }
    })
  });

  return {
    totalLabor,
    totalDisplacement,
    totalParts,
    totalIncoming,
    totalOutgoing,
    totalIncomingLabor,
    totalIncomingDisplacement,
    totalIncomingParts,
  };
}

export default async function ControlPanelSummary({ cases }: ControlPanelSummaryProps) {
  const data = await getData(cases);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Card title="Mão de obra Técnico">
        <p className={`${roboto.className} truncate rounded-xl bg-white px-2 py-4 text-center font-semibold text-md`}>
          {parseToCurrency(data.totalLabor)}
        </p>
      </Card>

      <Card title="Deslocamento Técnico">
      <p className={`${roboto.className} truncate rounded-xl bg-white px-2 py-4 text-center font-semibold text-md`}>
          {parseToCurrency(data.totalDisplacement)}
        </p>
      </Card>

      <Card title="Peças Técnico">
      <p className={`${roboto.className} truncate rounded-xl bg-white px-2 py-4 text-center font-semibold text-md`}>
          {parseToCurrency(data.totalParts)}
        </p>
      </Card>

      <Card title="Mão de obra Seguradora">
      <p className={`${roboto.className} truncate rounded-xl bg-white px-2 py-4 text-center font-semibold text-md`}>
          {parseToCurrency(data.totalIncomingLabor)}
        </p>
      </Card>

      <Card title="Deslocamento Seguradora">
      <p className={`${roboto.className} truncate rounded-xl bg-white px-2 py-4 text-center font-semibold text-md`}>
          {parseToCurrency(data.totalIncomingDisplacement)}
        </p>
      </Card>

      <Card title="Peças Seguradora">
      <p className={`${roboto.className} truncate rounded-xl bg-white px-2 py-4 text-center font-semibold text-md`}>
          {parseToCurrency(data.totalIncomingParts)}
        </p>
      </Card>

      <Card title="Total entrada">
      <p className={`${roboto.className} truncate rounded-xl bg-white px-2 py-4 text-center font-semibold text-md`}>
          {parseToCurrency(data.totalIncoming)}
        </p>
      </Card>

      <Card title="Total saída" size="md">
      <p className={`${roboto.className} truncate rounded-xl bg-white px-2 py-4 text-center font-semibold text-md`}>
          {parseToCurrency(data.totalOutgoing)}
        </p>
      </Card>

      <Card title="Total de casos">
      <p className={`${roboto.className} truncate rounded-xl bg-white px-2 py-4 text-center font-semibold text-md`}>
          {cases.length}
        </p>
      </Card>
    </div>
  );
}