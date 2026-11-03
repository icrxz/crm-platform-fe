'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useId } from 'react';

export interface StepperStep {
  key: string;
  label: string;
  done?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentKey: string;
  onSelect: (key: string) => void;
  ariaLabel: string;
}

function stepName(step: StepperStep, index: number) {
  return `${index + 1}. ${step.label}${step.done ? ' (concluída)' : ''}`;
}

// Navegação livre entre etapas: horizontal a partir de md, um select no
// celular, onde uma fileira de etapas não cabe.
export function Stepper({
  steps,
  currentKey,
  onSelect,
  ariaLabel,
}: StepperProps) {
  const selectId = useId();
  const currentIndex = steps.findIndex((step) => step.key === currentKey);

  return (
    <nav aria-label={ariaLabel}>
      <ol className="hidden items-start md:flex">
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.key}
              className={clsx('flex items-start', !isLast && 'flex-1')}
            >
              <button
                type="button"
                onClick={() => onSelect(step.key)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={stepName(step, index)}
                className="group flex w-24 flex-col items-center gap-1 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <span
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    isCurrent && 'border-blue-500 bg-blue-500 text-white',
                    !isCurrent &&
                      step.done &&
                      'border-green-500 bg-green-50 text-green-600',
                    !isCurrent &&
                      !step.done &&
                      'border-gray-300 bg-white text-gray-500 group-hover:border-gray-400'
                  )}
                >
                  {step.done && !isCurrent ? (
                    <CheckIcon className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={clsx(
                    'text-center text-xs leading-tight',
                    isCurrent ? 'font-semibold text-gray-900' : 'text-gray-600'
                  )}
                >
                  {step.label}
                </span>
              </button>

              {!isLast && (
                <span
                  aria-hidden
                  className={clsx(
                    'mt-4 h-0.5 flex-1',
                    step.done ? 'bg-green-400' : 'bg-gray-200'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="md:hidden">
        <label htmlFor={selectId} className="sr-only">
          {ariaLabel}
        </label>
        <select
          id={selectId}
          value={currentKey}
          onChange={(event) => onSelect(event.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-900"
        >
          {steps.map((step, index) => (
            <option key={step.key} value={step.key}>
              Etapa {index + 1} de {steps.length} · {step.label}
              {step.done ? ' ✓' : ''}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
