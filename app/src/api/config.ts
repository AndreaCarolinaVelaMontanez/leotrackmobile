import client from './client';

export async function getConfig(): Promise<{ downloadUrl: string }> {
  const { data } = await client.get('/config');
  return data;
}
