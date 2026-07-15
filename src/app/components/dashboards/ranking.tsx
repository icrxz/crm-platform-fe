import {
  fetchRankingData,
  RankingAgent,
} from '@/app/services/cases/fetch_ranking';
import { TrophyIcon } from '@heroicons/react/24/outline';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-600',
  'bg-cyan-600',
];

function getAvatarColor(name: string): string {
  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

function DelayBar({ inProgress }: { inProgress: RankingAgent['inProgress'] }) {
  const total = inProgress.green + inProgress.yellow + inProgress.red;
  if (total === 0)
    return (
      <div className="h-6 w-full rounded bg-gray-100 text-center text-xs leading-6 text-gray-400">
        Sem casos em andamento
      </div>
    );

  return (
    <div className="flex h-6 w-full overflow-hidden rounded text-xs font-bold text-white">
      {inProgress.green > 0 && (
        <div
          className="flex items-center justify-center bg-emerald-500"
          style={{ width: `${(inProgress.green / total) * 100}%` }}
        >
          {inProgress.green}
        </div>
      )}
      {inProgress.yellow > 0 && (
        <div
          className="flex items-center justify-center bg-amber-400"
          style={{ width: `${(inProgress.yellow / total) * 100}%` }}
        >
          {inProgress.yellow}
        </div>
      )}
      {inProgress.red > 0 && (
        <div
          className="flex items-center justify-center gap-1 bg-red-500"
          style={{ width: `${(inProgress.red / total) * 100}%` }}
        >
          <span>{inProgress.red}</span>
          {inProgress.mostDelayed && (
            <span className="hidden truncate sm:inline">
              #{inProgress.mostDelayed}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function FinalizedBar({ finalized }: { finalized: RankingAgent['finalized'] }) {
  const total = finalized.vistoria + finalized.reparo;
  if (total === 0) return null;

  return (
    <div className="flex h-6 w-full overflow-hidden rounded text-xs font-bold text-white">
      <div
        className="flex items-center justify-center bg-blue-500"
        style={{ width: `${(finalized.vistoria / total) * 100}%` }}
      >
        {finalized.vistoria}
      </div>
      <div
        className="flex items-center justify-center bg-violet-500"
        style={{ width: `${(finalized.reparo / total) * 100}%` }}
      >
        {finalized.reparo}
      </div>
    </div>
  );
}

export default async function Ranking() {
  const result = await fetchRankingData();
  const agents = result.data ?? [];

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-xl bg-gray-50 p-4 shadow-sm">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-gray-800">
            Ranking – Atendimento
          </span>
        </div>
        <button className="text-sm text-blue-600 hover:underline">
          Ver Todos
        </button>
      </div>

      <div className="shrink-0 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 text-center text-sm font-bold text-white shadow-sm">
        🏆 Bônus Liderança Geral: R$ 400,00
      </div>

      <div className="grid shrink-0 grid-cols-[16px_1fr] gap-x-3 gap-y-0.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        <span>#</span>
        <div className="grid grid-cols-[auto_1fr] gap-x-3">
          <span className="w-20">Atendente</span>
          <div className="grid grid-cols-2 gap-x-2">
            <span>Em Andamento</span>
            <span>Finalizados</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-around overflow-hidden">
        {agents.map((agent, idx) => {
          const totalFinalized =
            agent.finalized.vistoria + agent.finalized.reparo;
          return (
            <div
              key={agent.name}
              className="grid grid-cols-[16px_1fr] items-center gap-x-3"
            >
              <span className="text-center text-base leading-none">
                {MEDAL[idx] ?? (
                  <span className="text-xs font-semibold text-gray-500">
                    {idx + 1}
                  </span>
                )}
              </span>

              <div className="grid grid-cols-[auto_1fr] items-center gap-x-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 shrink-0 rounded-full ${getAvatarColor(agent.name)} flex items-center justify-center text-xs font-bold text-white`}
                  >
                    {getInitials(agent.name)}
                  </div>
                  <div className="hidden min-w-[72px] sm:block">
                    <p className="text-xs font-semibold leading-tight text-gray-800">
                      {agent.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {totalFinalized} fin.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-2">
                  <div className="flex flex-col gap-0.5">
                    <DelayBar inProgress={agent.inProgress} />
                    <div className="flex gap-2 text-[9px] text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        ≤5d
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                        5–10d
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                        &gt;10d
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <FinalizedBar finalized={agent.finalized} />
                    <div className="flex gap-2 text-[9px] text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                        Vist.
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
                        Rep.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
