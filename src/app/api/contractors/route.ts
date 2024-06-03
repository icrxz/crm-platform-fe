import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT
const crmCoreApiKey = process.env.CRM_CORE_API_KEY

export async function GET(request: NextRequest): Promise<Response> {
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
      const resData = JSON.stringify({message: "unauthorized"})
      return new NextResponse(resData, {
        status: 401,
      });
    }

    const resData = JSON.stringify({message: "client unavailable"})
    return new NextResponse(resData, {
      status: 424,
    });
  }

  const resData = await response.json()
  return new NextResponse(JSON.stringify(resData), {
    status: 200,
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  const reqBody = await request.json();
  const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors`;
  const jwt = cookies().get("jwt");
  console.log("jwt", jwt);

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(reqBody),
    headers: {
      "Content-Type": 'application/json',
      "X-API-Key": crmCoreApiKey || '',
      "Authorization": `Bearer ${jwt?.value}`
    }
  });

  console.log("resposta da api", response)

  if (response.status !== 201) {
    if (response.status === 401) {
      const resData = JSON.stringify({message: "unauthorized"})
      return new NextResponse(resData, {
        status: 401,
      });
    }

    const resData = JSON.stringify({message: "client unavailable"})
    return new NextResponse(resData, {
      status: 424,
    });
  }

  const resData = await response.json()
  return new NextResponse(JSON.stringify(resData), {
    status: 201,
  });
}

const buildQueryParams = (queryParams: URLSearchParams): string => {
  let stringifiedParams = "";

  queryParams.forEach((val, key) => {
    stringifiedParams = `${key}=${val}${stringifiedParams}`;
  })

  stringifiedParams = stringifiedParams.trimEnd();
  return stringifiedParams;
}
