import { useLiveQuery } from 'dexie-react-hooks';
import { examService } from '../../../services/examService';

export function useExams() {
  return useLiveQuery(() => examService.getAll(), []);
}
