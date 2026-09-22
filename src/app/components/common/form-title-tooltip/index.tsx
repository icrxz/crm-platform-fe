'use client';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '../tooltip';

interface FormTitleWithTooltipProps {
  title: string;
  tooltip: string;
  titleSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const TITLE_SIZE_CLASSES: Record<
  NonNullable<FormTitleWithTooltipProps['titleSize']>,
  string
> = {
  sm: 'text-sm',
  md: 'text-md',
  lg: 'text-lg',
  xl: 'text-xl',
};

export function FormTitleWithTooltip({
  title,
  tooltip,
  titleSize = 'sm',
}: FormTitleWithTooltipProps) {
  return (
    <div
      className={`ml-2 flex items-center gap-1.5 font-semibold ${TITLE_SIZE_CLASSES[titleSize]}`}
    >
      <span>{title}</span>
      <Tooltip content={tooltip} position="right" textSize="sm" wrap>
        <QuestionMarkCircleIcon className="h-4 w-4 cursor-help text-gray-400" />
      </Tooltip>
    </div>
  );
}
