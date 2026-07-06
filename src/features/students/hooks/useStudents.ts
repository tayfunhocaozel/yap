import { useLiveQuery } from 'dexie-react-hooks';
import { studentService } from '../../../services/studentService';

export function useStudents(classId: string) {
  return useLiveQuery(() => studentService.getActiveByClass(classId), [classId]);
}

export function useInactiveStudents(classId: string) {
  return useLiveQuery(() => studentService.getInactiveByClass(classId), [classId]);
}
