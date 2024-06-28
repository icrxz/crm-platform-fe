export type ServiceResponse<DataType> = {
  success: boolean;
  message: string;
  unauthorized?: boolean;
  data?: DataType;
};
