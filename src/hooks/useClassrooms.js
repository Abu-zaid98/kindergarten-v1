import { useLiveQuery } from 'dexie-react-hooks';
import { listClassrooms } from '../db/classrooms';

export function useClassrooms() {
  const classrooms = useLiveQuery(() => listClassrooms(), []) || [];
  return { classrooms };
}
