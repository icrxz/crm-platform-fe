import { ArrowPathIcon, InboxIcon } from '@heroicons/react/24/outline';
import { Button } from './button';

interface EmptyStateProps {
  message?: string;
  onRefresh?: () => void;
  refreshLabel?: string;
  className?: string;
}

const DEFAULT_MESSAGE = 'Nenhum resultado encontrado.';

// Generic "nothing to show" state — used wherever a list/table can come
// back empty (see ListPageLayout's isEmpty prop). Message is overridable
// per caller; onRefresh is optional since not every empty list is
// worth offering a manual refresh for.
export function EmptyState({
  message = DEFAULT_MESSAGE,
  onRefresh,
  refreshLabel = 'Atualizar',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-3 py-12 text-center ${className ?? ''}`}
    >
      <InboxIcon className="h-10 w-10 text-gray-300" />
      <p className="text-sm text-gray-500">{message}</p>

      {onRefresh && (
        <Button
          type="button"
          scheme="quiet"
          color="neutral"
          size="sm"
          onClick={onRefresh}
        >
          <ArrowPathIcon className="mr-2 h-4 w-4" />
          {refreshLabel}
        </Button>
      )}
    </div>
  );
}
