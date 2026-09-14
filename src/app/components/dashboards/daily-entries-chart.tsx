'use client';

import { DailyEntry } from '@/app/services/cases/fetch_daily_entries';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const BAR_COLORS = [
  '#3b82f6',
  '#f97316',
  '#10b981',
  '#8b5cf6',
  '#ef4444',
  '#eab308',
  '#06b6d4',
  '#ec4899',
];

export default function DailyEntriesChart({
  data,
  contractors,
  month,
}: {
  data: DailyEntry[];
  contractors: string[];
  month: string;
}) {
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-xl bg-gray-50 p-4 shadow-sm">
      <div className="flex shrink-0 items-start gap-2">
        <ChartBarIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
        <div>
          <span className="font-semibold text-gray-800">
            Entrada de Casos por Dia
          </span>
          <p className="text-xs text-gray-500">
            Casos criados no mês, por seguradora
          </p>
        </div>
      </div>

      <ResponsiveContainer
        width="100%"
        height="100%"
        minHeight={240}
        className="min-h-0 flex-1"
      >
        <BarChart
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
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            interval={Math.max(Math.ceil(data.length / 15) - 1, 0)}
          />
          <YAxis
            allowDecimals={false}
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
            cursor={{ fill: '#f3f4f6' }}
            labelFormatter={(label) => `${label}/${month}`}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          {contractors.map((name, idx) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="entries"
              fill={BAR_COLORS[idx % BAR_COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
