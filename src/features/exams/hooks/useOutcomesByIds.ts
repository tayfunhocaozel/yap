import { useLiveQuery } from 'dexie-react-hooks';
import { curriculumOutcomeRepository } from '../../../repositories/curriculumOutcomeRepository';

export function useOutcomesByIds(ids: string[]) {
  const key = ids.slice().sort().join(',');
  return useLiveQuery(() => curriculumOutcomeRepository.getByIds(ids), [key]);
}
