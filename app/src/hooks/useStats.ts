import { useQuery } from '@tanstack/react-query';
import * as statsApi from '../api/stats';

export function useStats(period: string, ref?: string, weekStart?: string) {
  return useQuery({
    queryKey: ['stats', period, ref, weekStart],
    queryFn: () => statsApi.getStats(period, ref, weekStart),
  });
}

export function useWeeklyActivity(ref?: string) {
  return useQuery({
    queryKey: ['weekly-activity', ref],
    queryFn: () => statsApi.getWeeklyActivity(ref),
  });
}
