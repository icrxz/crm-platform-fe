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
  { week: 'S1', tma: 4.2, volume: 38 },
  { week: 'S2', tma: 3.8, volume: 42 },
  { week: 'S3', tma: 5.1, volume: 55 },
  { week: 'S4', tma: 4.6, volume: 50 },
  { week: 'S5', tma: 3.5, volume: 44 },
  { week: 'S6', tma: 3.2, volume: 47 },
];

const LEGEND_LABELS: Record<string, string> = {
  tma: 'TMA (dias)',
  volume: 'Volume de Casos',
};

export default function PerformanceChart() {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <ChartBarIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <div>
            <span className="font-semibold text-gray-800">
              Evolução de Desempenho (TMA)
            </span>
            <p className="text-xs text-gray-500">
              Tempo Médio de Atendimento vs Volume Recebido
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 16, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="tma"
            orientation="left"
            domain={[0, 8]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="volume"
            orientation="right"
            domain={[0, 70]}
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
            yAxisId="tma"
            type="monotone"
            dataKey="tma"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="volume"
            type="monotone"
            dataKey="volume"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
