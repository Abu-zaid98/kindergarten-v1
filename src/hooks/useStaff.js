import { useLiveQuery } from 'dexie-react-hooks';
import { listSalaryPayments, listStaff, salaryRowsForMonth } from '../db/staff';

export function useStaff() { return { staff: useLiveQuery(() => listStaff(), []) || [] }; }
export function useSalaryRows(year, month) { return useLiveQuery(() => salaryRowsForMonth(year, month), [year, month]) || []; }
export function useStaffSalaryHistory(staffId) { return useLiveQuery(() => staffId ? listSalaryPayments(staffId) : [], [staffId]) || []; }
