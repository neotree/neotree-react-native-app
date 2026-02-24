import moment from 'moment';
import { toLocalISOString } from './toLocalISOString';

type DateLikeFieldType = 'date' | 'datetime' | 'time' | string | undefined;
type NormalizeOptions = {
  preserveTimezoneAwareInput?: boolean;
};

export const parseDateLikeValue = (value: unknown, fieldType?: DateLikeFieldType): Date | null => {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return null;

    if (fieldType === 'time' && /^\d{1,2}:\d{2}$/.test(raw)) {
      const [h, m] = raw.split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return moment().startOf('day').hour(h).minute(m).second(0).millisecond(0).toDate();
    }

    let normalized = raw;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)) {
      normalized = `${normalized}:00`;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      normalized = `${normalized}T00:00:00`;
    }
    normalized = normalized.replace(' ', 'T');

    const parsed = new Date(normalized);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value as any);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const hasExplicitTimezone = (value: string): boolean => {
  const text = value.trim();
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(text);
};

export const normalizeDateLikeValue = (
  value: unknown,
  fieldType?: DateLikeFieldType,
  options?: NormalizeOptions
): string | null => {
  const parsed = parseDateLikeValue(value, fieldType);
  if (!parsed) return null;

  const preserveTimezoneAwareInput = options?.preserveTimezoneAwareInput ?? true;
  if (
    preserveTimezoneAwareInput &&
    typeof value === 'string' &&
    hasExplicitTimezone(value)
  ) {
    return parsed.toISOString();
  }

  return toLocalISOString(parsed);
};

export const formatDateLikeLabel = (value: unknown, fieldType?: DateLikeFieldType): string | null => {
  const parsed = parseDateLikeValue(value, fieldType);
  if (!parsed) return null;

  switch (fieldType) {
    case 'date':
      return moment(parsed).format('YYYY-MM-DD');
    case 'datetime':
      return moment(parsed).format('YYYY-MM-DD HH:mm');
    case 'time':
      return moment(parsed).format('HH:mm');
    default:
      return null;
  }
};

export const isTimestampLabel = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const text = value.trim();
  if (!text) return false;
  if (!/[T ]\d{2}:\d{2}/.test(text)) return false;
  return !isNaN(new Date(text).getTime());
};
