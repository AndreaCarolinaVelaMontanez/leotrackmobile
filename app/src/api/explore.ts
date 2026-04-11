import client from './client';
import { ExploreData } from '../types';

export async function getExplore(): Promise<ExploreData> {
  const res = await client.get<ExploreData>('/explore');
  return res.data;
}
