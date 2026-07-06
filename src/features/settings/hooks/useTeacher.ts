import { useLiveQuery } from 'dexie-react-hooks';
import { teacherService } from '../../../services/teacherService';

export function useTeacher() {
  return useLiveQuery(() => teacherService.getActive(), []);
}
