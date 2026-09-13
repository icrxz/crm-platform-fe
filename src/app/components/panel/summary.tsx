'use server';

import { parseToCurrency } from '@/app/libs/parser';
import { PanelCaseItem } from '@/app/types/panel-case-item';
import { TransactionType } from '@/app/types/transaction';
import { roboto } from '@/app/ui/fonts';
import { Card } from '../common/card';

interface ControlPanelSummaryProps {
  cases: PanelCaseItem[];
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
  totalProfit: number;
}

async function getData(cases: PanelCaseItem[]): Promise<PanelSummaryData> {
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
    });
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
    totalProfit: totalIncoming - totalOutgoing,
  };
}

function SummaryValue({
  value,
  emphasis,
}: {
  value: string;
  emphasis?: 'incoming' | 'outgoing';
}) {
  const emphasisClass =
    emphasis === 'incoming'
      ? 'bg-emerald-50 text-emerald-700'
      : emphasis === 'outgoing'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-white text-gray-900';

  return (
    <p
      className={`${roboto.className} text-md truncate rounded-xl px-2 py-3 text-center font-semibold ${emphasisClass}`}
    >
      {value}
    </p>
  );
}

export default async function ControlPanelSummary({
  cases,
}: ControlPanelSummaryProps) {
  const data = await getData(cases);

  const profitClass =
    data.totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-700';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 px-1">
        <p className={`${roboto.className} text-sm text-gray-600`}>
          Total de casos: <span className="font-semibold">{cases.length}</span>
        </p>
        <p className={`${roboto.className} text-sm text-gray-600`}>
          Lucro:{' '}
          <span className={`font-semibold ${profitClass}`}>
            {parseToCurrency(data.totalProfit)}
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Mão de obra Seguradora">
          <SummaryValue value={parseToCurrency(data.totalIncomingLabor)} />
        </Card>

        <Card title="Deslocamento Seguradora">
          <SummaryValue
            value={parseToCurrency(data.totalIncomingDisplacement)}
          />
        </Card>

        <Card title="Peças Seguradora">
          <SummaryValue value={parseToCurrency(data.totalIncomingParts)} />
        </Card>

        <Card title="Total entrada">
          <SummaryValue
            value={parseToCurrency(data.totalIncoming)}
            emphasis="incoming"
          />
        </Card>

        <Card title="Mão de obra Técnico">
          <SummaryValue value={parseToCurrency(data.totalLabor)} />
        </Card>

        <Card title="Deslocamento Técnico">
          <SummaryValue value={parseToCurrency(data.totalDisplacement)} />
        </Card>

        <Card title="Peças Técnico">
          <SummaryValue value={parseToCurrency(data.totalParts)} />
        </Card>

        <Card title="Total saída">
          <SummaryValue
            value={parseToCurrency(data.totalOutgoing)}
            emphasis="outgoing"
          />
        </Card>
      </div>
    </div>
  );
}
