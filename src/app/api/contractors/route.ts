"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT
const crmCoreApiKey = process.env.CRM_CORE_ENDPOINT

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors?${buildQueryParams(searchParams)}`

  const jwt = cookies().get("jwt")

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": 'application/json',
      "X-API-Key": crmCoreApiKey || '',
      "Authorization": `Bearer ${jwt?.value}`
    }
  })

  if (response.status !== 200) {
    if (response.status === 401) {
      redirect("/login")
    }
    return null
  }
}

export async function POST(request: NextRequest) {
  const reqBody = await request.json();
  const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors`;
  const jwt = cookies().get("jwt");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": 'application/json',
      "X-API-Key": crmCoreApiKey || '',
      "Authorization": `Bearer ${jwt?.value}`
    }
  });

  if (response.status !== 201) {
    if (response.status === 401) {
      redirect("/login");
    }
    return null;
  }
}

const buildQueryParams = (queryParams: URLSearchParams): string => {
  let stringifiedParams = "";

  queryParams.forEach((val, key) => {
    stringifiedParams = `${key}=${val}${stringifiedParams}`;
  })

  stringifiedParams = stringifiedParams.trimEnd();
  return stringifiedParams;
}
