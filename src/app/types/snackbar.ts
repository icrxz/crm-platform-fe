export enum SnackbarVariants {
  success = "bg-green-500",
  error = "bg-red-500",
  warning = "bg-yellow-500",
  info = "bg-blue-500",
}

export type SnackbarType = {
  key: string;
  text: React.ReactNode;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  variant?: SnackbarVariants;
};

export type TSnackbarProps = Omit<SnackbarType, 'key'> & {
  handleClose: () => void;
  open: boolean;
};
