import { cookies } from "next/headers";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export async function GET(request: Request, { params }: { params: { caseID: string; }; }) {
  const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${params.caseID}/report`;
  const jwt = cookies().get("jwt")?.value;

  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      "Content-Type": 'application/json',
      "X-API-Key": crmCoreApiKey || '',
      "Authorization": `Bearer ${jwt}`
    },
  });

  if (!resp.ok) {
    return new Response(JSON.stringify({ error: 'Error fetching report' }), {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const strMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const strFileName = resp.headers.get("content-type")?.split(';')[1] || "";
  console.log("file content type", strMimeType, strFileName);

  const respBlob = await resp.blob();

  return new Response(respBlob, {
    headers: {
      'Content-Type': strMimeType,
      'Content-Disposition': `attachment; filename=${strFileName}`,
    }
  });
}
