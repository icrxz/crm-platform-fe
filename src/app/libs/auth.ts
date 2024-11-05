import { NextAuthOptions } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from "next/headers";
import { z } from 'zod';
import { User, UserRole } from "../types/user";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 12,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        try {
          const result = await fetch(`${crmCoreEndpoint}/crm/core/api/v1/login`, {
            method: "POST",
            body: JSON.stringify({
              email: email,
              password: password
            }),
            headers: { "Content-Type": "application/json" }
          });

          const authData = await result.json();
          if (!result.ok || !authData.token || !authData.user) {
            return null;
          };

          cookies().set("jwt", authData.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 12, // 12 hours
          });

          return authData.user;
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log(user);

        token.user_id = user.user_id;
        token.role = user.role;
        token.username = user.username;
        token.is_first_login = user.is_first_login;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.user_id = token.user_id as string;
        session.user.role = token.role as UserRole;
        session.user.username = token.username as string;
        session.user.isFirstLogin = token.is_first_login as boolean;
      }
      return session;
    },
  },
  events: {
    async signOut({ session, token }) {
      cookies().delete("jwt");
    }
  }
};
