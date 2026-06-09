'use client';

import { useState } from 'react';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-lime-600',
  'bg-sky-500',
];

function getAvatarColor(name: string, index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AttendanceBonus({
  employees,
}: {
  employees: string[];
}) {
  const [eliminated, setEliminated] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setEliminated((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  const active = employees.length - eliminated.size;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800">Bônus Assiduidade</span>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
          R$ 200,00
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          <span className="font-semibold text-emerald-600">{active}</span>{' '}
          ativos &nbsp;·&nbsp;
          <span className="font-semibold text-gray-400">
            {eliminated.size}
          </span>{' '}
          eliminados
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {employees.map((name, idx) => {
          const isEliminated = eliminated.has(idx);
          return (
            <button
              key={name}
              onClick={() => toggle(idx)}
              className="group flex flex-col items-center gap-1"
              title={isEliminated ? `Reativar ${name}` : `Eliminar ${name}`}
            >
              <div className="relative">
                <div
                  className={[
                    'flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white transition-all',
                    getAvatarColor(name, idx),
                    isEliminated
                      ? 'ring-2 ring-gray-300 grayscale'
                      : 'ring-2 ring-green-400 ring-offset-1',
                  ].join(' ')}
                >
                  {getInitials(name)}
                </div>
                {isEliminated && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                    <span className="text-base font-bold text-white">✕</span>
                  </div>
                )}
              </div>
              <span
                className={`max-w-full truncate text-[10px] leading-tight ${isEliminated ? 'text-gray-400 line-through' : 'text-gray-600'}`}
              >
                {name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-gray-400">
        Clique no avatar para registrar ausência ou atraso
      </p>
    </div>
  );
}
