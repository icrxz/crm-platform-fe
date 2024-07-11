"use client";
import { createContext, ReactNode, useContext, useState } from 'react';

type SnackbarType = 'info' | 'success' | 'error' | 'warning';

interface SnackbarState {
  message: string;
  type: SnackbarType;
  open: boolean;
}

interface SnackbarContextProps {
  snackbar: SnackbarState;
  showSnackbar: (message: string, type?: SnackbarType) => void;
  closeSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(undefined);

export const useSnackbar = (): SnackbarContextProps => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider = ({ children }: { children: ReactNode; }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    message: '',
    type: 'info',
    open: false,
  });

  const showSnackbar = (message: string, type: SnackbarType = 'info') => {
    setSnackbar({ message, type, open: true });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <SnackbarContext.Provider value={{ snackbar, showSnackbar, closeSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
};
