import { useQuery } from '@tanstack/react-query';
import * as statsApi from '../api/stats';

export function useStats(period: string, ref?: string) {
  return useQuery({
    queryKey: ['stats', period, ref],
    queryFn: () => statsApi.getStats(period, ref),
  });
}
