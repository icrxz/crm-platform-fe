import { fetchOperators } from '@/app/services/users/fetch_operators';
import AttendanceBonus from './attendance-bonus';

export default async function AttendanceBonusServer() {
  const result = await fetchOperators();
  const employees = (result.data ?? []).map((u) =>
    `${u.first_name} ${u.last_name}`.trim()
  );
  return <AttendanceBonus employees={employees} />;
}
