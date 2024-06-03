"use client";

import { signIn } from 'next-auth/react';

export async function login(_currentState: unknown, formData: FormData) {
  try {
    const authData = {
      email: formData.get("email"),
      password: formData.get("password")
    };

    signIn('credentials', {
      ...authData,
      callbackUrl: "/home"
    });
  } catch (ex) {
    switch (ex) {
      case "CredentialsSignin":
        return 'Invalid credentials.';
      default:
        return "something gone wrong"
    }

  }
}
