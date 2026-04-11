import { useQuery } from '@tanstack/react-query';
import * as exploreApi from '../api/explore';

export function useExplore() {
  return useQuery({
    queryKey: ['explore'],
    queryFn: exploreApi.getExplore,
    staleTime: 5 * 60 * 1000, // 5 min — community data doesn't change that fast
  });
}
