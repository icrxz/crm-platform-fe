export async function getApiErrorMessage(
  resp: Response,
  fallback: string
): Promise<string> {
  try {
    const data = await resp.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}
