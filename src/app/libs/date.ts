import { parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

export const PATTERN_DEFAULT = 'dd/MM/yyyy HH:mm';
export const API_PATTERN_DEFAULT = 'yyyy-MM-ddTHH:mm:ss.SSSSSS';
export const ONLY_DATE_PATTERN = 'dd/MM/yyyy';

// The backend stores timestamps in a timezone-less column and returns them
// tagged as UTC, but they should always be displayed in Brazil's local time
// regardless of the server/browser's own timezone (e.g. Vercel's UTC runtime).
const APP_TIMEZONE = 'America/Sao_Paulo';

function getFormat(date: string, pattern = PATTERN_DEFAULT) {
  return formatInTimeZone(parseISO(date), APP_TIMEZONE, pattern, {
    locale: ptBR,
  });
}

export function parseDateTime(date: string, pattern: string = PATTERN_DEFAULT) {
  if (!date || date === '') return '';

  try {
    return getFormat(date, pattern);
  } catch (error) {
    return '';
  }
}

export function timeElapsed(startDate: Date, endDate: Date): string {
  const diffInMs: number = endDate.getTime() - startDate.getTime();

  const diffInHours: number = diffInMs / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return `${diffInHours.toFixed(0)} horas`;
  }

  const diffInDays: number = diffInMs / (1000 * 60 * 60 * 24);

  return `${diffInDays.toFixed(0)} dias`;
}
