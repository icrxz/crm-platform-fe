"use client";
import { useEffect } from 'react';
import { useSnackbar } from '../../../context/SnackbarProvider';

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

  const getSnackbarStyles = () => {
    switch (snackbar.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 p-4 rounded shadow-lg text-white ${getSnackbarStyles()}`}>
      {snackbar.message}
      <button onClick={closeSnackbar} className="ml-4">
        X
      </button>
    </div>
  );
};

export default Snackbar;
