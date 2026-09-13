import { useLiveQuery } from 'dexie-react-hooks';
import { listStudents } from '../db/students';

export function useStudents() {
  const students = useLiveQuery(() => listStudents(), []) || [];
  return { students, loading: students === undefined };
}
