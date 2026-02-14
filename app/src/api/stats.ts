import client from './client';
import { StatsSummary } from '../types';

export async function getStats(period: string, ref?: string): Promise<StatsSummary> {
  const params: any = { period };
  if (ref) params.ref = ref;
  const { data } = await client.get('/stats', { params });
  return data;
}
