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

const agents = [
  {
    name: 'Daniel',
    closed: [15, 7, 1] as [number, number, number],
    visitRepair: [8, 17] as [number, number],
  },
  {
    name: 'Maria',
    closed: [15, 7, 1] as [number, number, number],
    visitRepair: [8, 17] as [number, number],
  },
  {
    name: 'João',
    closed: [15, 7, 1] as [number, number, number],
    visitRepair: [8, 17] as [number, number],
  },
  {
    name: 'Ana',
    closed: [15, 7, 1] as [number, number, number],
    visitRepair: [8, 17] as [number, number],
  },
];

function SegmentedBar({
  segments,
  colors,
}: {
  segments: number[];
  colors: string[];
}) {
  const total = segments.reduce((a, b) => a + b, 0);
  return (
    <div className="flex h-6 w-full overflow-hidden rounded">
      {segments.map((val, i) => (
        <div
          key={i}
          className={`${colors[i]} flex items-center justify-center text-xs font-bold text-white`}
          style={{ width: `${(val / total) * 100}%` }}
        >
          {val}
        </div>
      ))}
    </div>
  );
}

export default function Ranking() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
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

      <div className="grid grid-cols-[auto_auto_1fr_1fr] items-center gap-x-3 gap-y-1 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>#</span>
        <span>Atendente</span>
        <span>FINALIZADOS</span>
        <span>VIST. / REPARO</span>
      </div>

      {agents.map((agent, idx) => (
        <div
          key={agent.name}
          className="grid grid-cols-[auto_auto_1fr_1fr] items-center gap-x-3"
        >
          <span className="w-8 text-center text-lg">
            {MEDAL[idx] ?? (
              <span className="text-sm font-semibold text-gray-500">
                {idx + 1}
              </span>
            )}
          </span>

          <div
            className={`h-8 w-8 rounded-full ${getAvatarColor(agent.name)} flex items-center justify-center text-xs font-bold text-white`}
          >
            {getInitials(agent.name)}
          </div>

          <SegmentedBar
            segments={agent.closed}
            colors={['bg-emerald-500', 'bg-orange-400', 'bg-red-500']}
          />

          <SegmentedBar
            segments={agent.visitRepair}
            colors={['bg-cyan-500', 'bg-blue-500']}
          />
        </div>
      ))}
    </div>
  );
}
