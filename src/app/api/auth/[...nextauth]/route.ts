import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';
import { z } from 'zod';

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;

const handler = NextAuth({
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

        if (parsedCredentials.success) {
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
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as any;
      }
      return token;
    }
  },
  events: {
    async signOut({ session, token }) {
      cookies().delete("jwt");
    }
  }
});

export { handler as GET, handler as POST };
