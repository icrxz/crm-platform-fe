import clsx from 'clsx';
import { ReactNode } from 'react';

interface ListItemCardGroupProps {
  children: ReactNode;
}

// Wraps a table's `<table className="hidden md:table">` sibling: the card
// stack shown in its place below md.
export function ListItemCardGroup({ children }: ListItemCardGroupProps) {
  return <div className="flex flex-col gap-3 md:hidden">{children}</div>;
}

interface ListItemCardField {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

interface ListItemCardProps {
  title: ReactNode;
  fields: ListItemCardField[];
  actions?: ReactNode;
  onClick?: () => void;
}

// Mobile counterpart to a table row (see ListPageLayout / *table.tsx):
// below md, tables are hidden entirely (no room for columns), and each
// row's fields are shown here instead as a label/value card.
export function ListItemCard({
  title,
  fields,
  actions,
  onClick,
}: ListItemCardProps) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-3 rounded-md bg-white p-4 shadow-sm',
        onClick && 'cursor-pointer active:bg-gray-50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        {actions && (
          <div
            className="flex shrink-0 gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        {fields.map((field) => (
          <div
            key={field.label}
            className={field.fullWidth ? 'col-span-2' : undefined}
          >
            <dt className="text-xs text-gray-500">{field.label}</dt>
            <dd className="text-gray-900">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
