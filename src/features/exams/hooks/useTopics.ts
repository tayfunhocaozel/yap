import { useLiveQuery } from 'dexie-react-hooks';
import { topicRepository } from '../../../repositories/topicRepository';
import type { Grade } from '../../../types/entities';

export function useTopics(subjectId: string, grade: Grade | undefined) {
  return useLiveQuery(
    () => (grade ? topicRepository.getBySubjectAndGrade(subjectId, grade) : Promise.resolve([])),
    [subjectId, grade],
  );
}
