import { format, Locale, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PATTERN_DEFAULT = 'dd/MM/yyyy HH:mm';
export const API_PATTERN_DEFAULT = 'yyyy-MM-ddTHH:mm:ss.SSSSSS';

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
