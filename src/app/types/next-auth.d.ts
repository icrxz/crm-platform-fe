import { DefaultSession } from "next-auth";
import { UserRole } from "./user";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      user_id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}
