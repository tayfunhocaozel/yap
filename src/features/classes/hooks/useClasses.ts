import { useLiveQuery } from 'dexie-react-hooks';
import { classService } from '../../../services/classService';

export function useClasses() {
  return useLiveQuery(() => classService.getAllActive(), []);
}
