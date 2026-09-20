import { useLiveQuery } from 'dexie-react-hooks';
import { listPaymentsForStudent, paymentMatrixForYear, paymentsForMonth, paymentsOnDate } from '../db/payments';
import { enrollmentRows, getEnrollmentPayment } from '../db/enrollmentPayments';

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

export function usePaymentMatrix(year, months) {
  const signature = months.join(',');
  return useLiveQuery(() => paymentMatrixForYear(year, months), [year, signature]) || [];
}

export function useEnrollmentRows() { return useLiveQuery(() => enrollmentRows(), []) || []; }
export function useEnrollmentPayment(studentId) { return useLiveQuery(() => studentId ? getEnrollmentPayment(studentId) : undefined, [studentId]); }
