import {
  BoltIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  StarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

type Achievement = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  status: 'achieved' | 'locked';
  color: string;
};

const achievements: Achievement[] = [
  {
    icon: DocumentCheckIcon,
    label: 'Primeiro Caso do Dia',
    status: 'achieved',
    color: 'bg-amber-400',
  },
  {
    icon: BoltIcon,
    label: '5 Casos em 1 Dia',
    status: 'locked',
    color: 'bg-gray-200',
  },
  {
    icon: ShieldCheckIcon,
    label: 'SLA Perfeito (100%)',
    status: 'locked',
    color: 'bg-gray-200',
  },
  {
    icon: StarIcon,
    label: 'Cliente Avaliou 9★',
    status: 'locked',
    color: 'bg-gray-200',
  },
];

export default function Achievements() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-gray-800">Conquistas</span>
        </div>
        <button className="text-sm text-blue-600 hover:underline">
          Ver Todos
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          const isAchieved = achievement.status === 'achieved';
          return (
            <div
              key={achievement.label}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-3"
            >
              <div className="relative h-10 w-10">
                <div
                  className={`h-10 w-10 rounded-full ${achievement.color} flex items-center justify-center`}
                >
                  <Icon
                    className={`h-5 w-5 ${isAchieved ? 'text-white' : 'text-gray-400'}`}
                  />
                </div>
                {!isAchieved && (
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5">
                    <LockClosedIcon className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium leading-tight text-gray-700">
                {achievement.label}
              </p>
              <div className="flex items-center gap-1">
                {isAchieved ? (
                  <>
                    <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">
                      Conquistado
                    </span>
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">Bloqueado</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
