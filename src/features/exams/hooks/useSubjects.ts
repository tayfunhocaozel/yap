import { useLiveQuery } from 'dexie-react-hooks';
import { subjectRepository } from '../../../repositories/subjectRepository';

export function useSubjects() {
  return useLiveQuery(() => subjectRepository.getAll(), []);
}
