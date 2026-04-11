import client from './client';
import { StatsSummary } from '../types';

export async function getStats(period: string, ref?: string, weekStart?: string): Promise<StatsSummary> {
  const params: any = { period };
  if (ref) params.ref = ref;
  if (weekStart) params.weekStart = weekStart;
  const { data } = await client.get('/stats', { params });
  return data;
}

export interface WeekData { label: string; minutes: number; }
export interface MonthActivity { monthKey: string; year: number; weeks: WeekData[]; }

export async function getWeeklyActivity(ref?: string): Promise<MonthActivity[]> {
  const params: any = {};
  if (ref) params.ref = ref;
  const { data } = await client.get('/stats/weekly-activity', { params });
  return data;
}
