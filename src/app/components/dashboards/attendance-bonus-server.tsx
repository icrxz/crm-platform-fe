import { fetchOperators } from '@/app/services/users/fetch_operators';
import AttendanceBonus from './attendance-bonus';

function isAbsenceInCurrentMonth(lastAbsenceAt: string | null): boolean {
  if (!lastAbsenceAt) return false;
  const now = new Date();
  const absenceDate = new Date(lastAbsenceAt);
  return (
    absenceDate.getUTCFullYear() === now.getUTCFullYear() &&
    absenceDate.getUTCMonth() === now.getUTCMonth()
  );
}

export default async function AttendanceBonusServer() {
  const result = await fetchOperators();
  const employees = (result.data ?? []).map((u) => ({
    id: u.user_id,
    name: `${u.first_name} ${u.last_name}`.trim(),
    isAbsent: isAbsenceInCurrentMonth(u.last_absence_at),
  }));
  return <AttendanceBonus employees={employees} />;
}
