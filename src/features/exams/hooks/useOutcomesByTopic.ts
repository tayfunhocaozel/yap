import { useLiveQuery } from 'dexie-react-hooks';
import { curriculumOutcomeRepository } from '../../../repositories/curriculumOutcomeRepository';

export function useOutcomesByTopic(topicId: string) {
  return useLiveQuery(
    () => (topicId ? curriculumOutcomeRepository.getByTopic(topicId) : Promise.resolve([])),
    [topicId],
  );
}
