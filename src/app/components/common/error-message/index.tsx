import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      className="flex h-4 items-end space-x-1 py-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      <p className="text-sm text-red-500">{message}</p>
    </div>
  );
}
