'use client';

import { ChartBarIcon } from '@heroicons/react/24/outline';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  { day: 'Seg', cases: 30, sla: 40, points: 20 },
  { day: 'Seg', cases: 25, sla: 45, points: 22 },
  { day: 'Ter', cases: 35, sla: 42, points: 28 },
  { day: 'Qua', cases: 40, sla: 48, points: 35 },
  { day: 'Qui', cases: 38, sla: 50, points: 40 },
  { day: 'Sáb', cases: 45, sla: 47, points: 42 },
  { day: 'Seg', cases: 50, sla: 52, points: 48 },
  { day: 'Sáb', cases: 55, sla: 55, points: 55 },
];

const LEGEND_LABELS: Record<string, string> = {
  cases: 'Casos Finalizados',
  sla: 'SLA no prazo',
  points: 'Pontos do Time',
};

export default function PerformanceChart() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-gray-800">
            Evolução de Desempenho
          </span>
        </div>
        <button className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
          Ver Histórico <span>›</span>
        </button>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 60]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 12,
            }}
            cursor={{ stroke: '#e5e7eb' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => LEGEND_LABELS[value] ?? value}
          />
          <Line
            type="monotone"
            dataKey="cases"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="sla"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="points"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
