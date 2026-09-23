'use client';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

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

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined
);

export const useSnackbar = (): SnackbarContextProps => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    message: '',
    type: 'info',
    open: false,
  });

  // Stable across renders (functional updates, no closed-over `snackbar`) —
  // consumers pass these into effect dependency arrays (e.g. ConfirmModal),
  // and a fresh reference each render there caused an infinite render loop:
  // calling showSnackbar re-rendered the provider, which produced a new
  // showSnackbar reference, which re-fired the effect, which called
  // showSnackbar again.
  const showSnackbar = useCallback(
    (message: string, type: SnackbarType = 'info') => {
      setSnackbar({ message, type, open: true });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(
    () => ({ snackbar, showSnackbar, closeSnackbar }),
    [snackbar, showSnackbar, closeSnackbar]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  );
};
