import { useLiveQuery } from 'dexie-react-hooks';
import { questionService } from '../../../services/questionService';

export function useQuestions(examId: string) {
  return useLiveQuery(() => questionService.getByExam(examId), [examId]);
}
