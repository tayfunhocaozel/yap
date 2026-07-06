import { useLiveQuery } from 'dexie-react-hooks';
import { teacherService } from '../../../services/teacherService';
import { useAuth } from '../../../app/authContext';

export function useTeacher() {
  const { session } = useAuth();
  const teacherId = session?.user.id;
  return useLiveQuery(() => (teacherId ? teacherService.getById(teacherId) : undefined), [teacherId]);
}
