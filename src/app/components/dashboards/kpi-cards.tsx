import { Tooltip } from '@/app/components/common/tooltip';
import {
  fetchDashboardKpis,
  MonthlyClosedCount,
} from '@/app/services/cases/fetch_dashboard_kpis';
import { ClockIcon, FireIcon } from '@heroicons/react/24/outline';

function MiniHistoryBars({ history }: { history: MonthlyClosedCount[] }) {
  const max = Math.max(...history.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5">
      {history.map((d) => (
        <div key={d.month} className="flex flex-col items-center gap-1">
          <Tooltip content={`${d.month}: ${d.count} casos`}>
            <div
              className="w-6 rounded-t bg-blue-400"
              style={{
                height: `${Math.max(Math.round((d.count / max) * 32), 4)}px`,
              }}
            />
          </Tooltip>
          <span className="text-[10px] text-gray-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-gray-50 p-4 shadow-sm">
      {children}
    </div>
  );
}

function ClosedCasesCard({ history }: { history: MonthlyClosedCount[] }) {
  const current = history[history.length - 1]?.count ?? 0;
  const prev = history[history.length - 2]?.count ?? 0;
  const pct = prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;

  return (
    <KpiCard>
      <div className="flex items-center gap-2">
        <FireIcon className="h-5 w-5 text-orange-500" />
        <span className="text-sm font-semibold text-gray-600">
          Casos Finalizados
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{current}</p>
          <p
            className={`text-xs font-medium ${pct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {pct >= 0 ? '+' : ''}
            {pct}% vs mês anterior ({prev} casos)
          </p>
        </div>
        <MiniHistoryBars history={history} />
      </div>
    </KpiCard>
  );
}

function SlaOnTimeCard({
  slaPercentage,
  slaGoal,
}: {
  slaPercentage: number;
  slaGoal: number;
}) {
  const achieved = slaPercentage >= slaGoal;

  return (
    <KpiCard>
      <div className="flex items-center gap-2">
        <ClockIcon className="h-5 w-5 text-blue-500" />
        <span className="text-sm font-semibold text-gray-600">
          SLA no Prazo
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{slaPercentage}%</p>
      <div className="flex flex-col gap-1">
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className={`h-2 rounded-full ${achieved ? 'bg-emerald-500' : 'bg-amber-400'}`}
            style={{ width: `${Math.min(slaPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          Meta: {slaGoal}%{' '}
          {achieved ? (
            <span className="font-semibold text-emerald-600">✓ Atingida</span>
          ) : (
            <span className="font-semibold text-amber-600">
              ⚠ Abaixo da meta
            </span>
          )}
        </p>
      </div>
    </KpiCard>
  );
}

export default async function KpiCards() {
  const kpisResult = await fetchDashboardKpis();

  const history = kpisResult.data?.closedHistory ?? [
    { month: '-', count: 0 },
    { month: '-', count: 0 },
    { month: '-', count: 0 },
  ];
  const slaPercentage = kpisResult.data?.slaPercentage ?? 0;
  const slaGoal = kpisResult.data?.slaGoal ?? 90;

  return (
    <div className="grid grid-cols-2 gap-4">
      <ClosedCasesCard history={history} />
      <SlaOnTimeCard slaPercentage={slaPercentage} slaGoal={slaGoal} />
    </div>
  );
}
