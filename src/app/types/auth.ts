import { User } from "./user";

export type Credentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};
