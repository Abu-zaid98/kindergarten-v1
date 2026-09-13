import { useLiveQuery } from 'dexie-react-hooks';
import { listPaymentsForStudent, paymentsForMonth, paymentsOnDate } from '../db/payments';

export function useMonthPayments(year, month) {
  return useLiveQuery(() => paymentsForMonth(year, month), [year, month]) || [];
}

export function useStudentPayments(studentId) {
  return useLiveQuery(
    () => (studentId ? listPaymentsForStudent(studentId) : []),
    [studentId],
  ) || [];
}

export function useDailyPayments(isoDate) {
  return useLiveQuery(() => paymentsOnDate(isoDate), [isoDate]) || [];
}
