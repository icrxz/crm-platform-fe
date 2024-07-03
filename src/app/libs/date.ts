import { format, Locale, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const PATTERN_DEFAULT = 'dd/MM/yyyy HH:mm';
export const API_PATTERN_DEFAULT = 'yyyy-MM-ddTHH:mm:ss.SSSSSS';
export const ONLY_DATE_PATTERN = 'dd/MM/yyyy';

const locales: Record<string, Locale> = { ptBR };

function getFormat(date: string, pattern = PATTERN_DEFAULT) {
  return format(parseISO(date), pattern, { locale: locales["ptBR"] });
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
    return `${diffInHours.toFixed(2)} horas`;
  }

  const diffInDays: number = diffInMs / (1000 * 60 * 60 * 24);

  return `${diffInDays.toFixed(2)} dias`;
}
