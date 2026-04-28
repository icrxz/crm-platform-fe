import {
  ClockIcon,
  FaceSmileIcon,
  FireIcon,
  StarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

function KpiCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-gray-50 p-4 shadow-sm">
      {children}
    </div>
  );
}

function ClosedCasesCard() {
  return (
    <KpiCard>
      <div className="flex items-center gap-2">
        <FireIcon className="h-5 w-5 text-orange-500" />
        <span className="text-sm font-semibold text-gray-600">
          Casos Finalizados
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900">102</p>
      <p className="text-xs font-medium text-emerald-600">
        + 12% vs semana passada
      </p>
    </KpiCard>
  );
}

function SlaOnTimeCard() {
  return (
    <KpiCard>
      <div className="flex items-center gap-2">
        <ClockIcon className="h-5 w-5 text-blue-500" />
        <span className="text-sm font-semibold text-gray-600">
          SLA no Prazo
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900">96%</p>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-emerald-500"
          style={{ width: '96%' }}
        />
      </div>
    </KpiCard>
  );
}

function ClientSatisfactionCard() {
  return (
    <KpiCard>
      <div className="flex items-center gap-2">
        <FaceSmileIcon className="h-5 w-5 text-yellow-500" />
        <span className="text-sm font-semibold text-gray-600">
          Satisfação do Cliente
        </span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((i) => (
          <StarSolid key={i} className="h-6 w-6 text-amber-400" />
        ))}
        <StarIcon className="h-6 w-6 text-gray-300" />
      </div>
      <p className="text-xs text-gray-500">4.0 / 5.0</p>
    </KpiCard>
  );
}

function TeamPointsCard() {
  return (
    <KpiCard>
      <div className="flex items-center gap-2">
        <TrophyIcon className="h-5 w-5 text-amber-500" />
        <span className="text-sm font-semibold text-gray-600">
          Pontos do Time
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900">3.650</p>
    </KpiCard>
  );
}

export default function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <ClosedCasesCard />
      <SlaOnTimeCard />
      <ClientSatisfactionCard />
      <TeamPointsCard />
    </div>
  );
}
