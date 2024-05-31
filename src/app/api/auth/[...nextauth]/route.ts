import NextAuth, { User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';
import { z } from 'zod';

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT

const handler = NextAuth({
  pages: {
    signIn: '/login',
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

            if (result.status !== 200) {
              return null;
            }

            const authData = await result.json();
            if (!authData.token || !authData.user) {
              return null
            };

            console.log("jwt recebido", authData.token)
            cookies().set("jwt", authData.token, {
              // httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 60 * 60 * 12, // 12 hours
            })

            return {
              email: authData.user.email,
              id: authData.user.user_id,
              name: authData.user.name
            } as User;
          } catch (e) {
            return null;
          }
        }

        return null;
      },
    }),
  ],
});

export { handler as GET, handler as POST }
