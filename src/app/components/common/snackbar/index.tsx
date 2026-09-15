'use client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useSnackbar } from '../../../context/SnackbarProvider';
import { IconButton } from '../icon-button';

const snackbarColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-orange-500',
  info: 'bg-blue-500',
};

const Snackbar = () => {
  const { snackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        closeSnackbar();
      }, 5000); // Fecha automaticamente após 5 segundos
      return () => clearTimeout(timer);
    }
  }, [snackbar, closeSnackbar]);

  if (!snackbar.open) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 flex items-center gap-4 rounded p-4 text-white shadow-lg ${snackbarColors[snackbar.type]}`}
    >
      {snackbar.message}
      <IconButton
        icon={<XMarkIcon className="h-5 w-5" />}
        color="white"
        onClick={closeSnackbar}
        title="Fechar"
      />
    </div>
  );
};

export default Snackbar;
