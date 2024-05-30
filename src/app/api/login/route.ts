import { Credentials, LoginResponse } from "@/app/_types/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const formData = await request.formData()

  const credentials: Credentials = {
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || ""
  }

  const res = await fetch('http:///localhost:8080/crm/core/api/v1/login', {
    method: "POST",
    body: JSON.stringify(credentials),
    headers: {
      "Content-Type": "application/json",
    }
  });

  const data: LoginResponse = await res.json();

  const cookieStorage = cookies()
  cookieStorage.set('token', data.token)

  return Response.json({ data })
}
