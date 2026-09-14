import {
  GiftIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const POSITION_COLORS = ['bg-amber-400', 'bg-gray-400', 'bg-orange-600'];

const rewards = [
  { icon: TrophyIcon, label: 'Destaque interno' },
  { icon: GiftIcon, label: 'Coffee voucher' },
  { icon: UserGroupIcon, label: 'Bônus coletivo' },
];

const positionInitials = ['D', 'M', 'J'];

export default function Rewards() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800">Recompensas do Mês</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Ranking Atual
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {rewards.map((reward, idx) => {
          const Icon = reward.icon;
          return (
            <div
              key={reward.label}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
                  <Icon className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {reward.label}
                </span>
              </div>
              <div
                className={`h-8 w-8 rounded-full ${POSITION_COLORS[idx]} flex items-center justify-center text-xs font-bold text-white`}
              >
                {positionInitials[idx]}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-gray-100 pt-2">
        <button className="text-sm text-blue-600 hover:underline">
          Como funciona a pontuação?
        </button>
      </div>
    </div>
  );
}
