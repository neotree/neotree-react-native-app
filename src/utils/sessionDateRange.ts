export type SessionDateField = 'started' | 'completed';

export interface SessionDateRangeOptions {
    minDate?: Date | string | null;
    maxDate?: Date | string | null;
    dateField?: SessionDateField;
}

function validDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(value: Date | string): number | null {
    const parsed = validDate(value);
    if (!parsed) return null;
    parsed.setHours(0, 0, 0, 0);
    return parsed.getTime();
}

function endOfDay(value: Date | string): number | null {
    const parsed = validDate(value);
    if (!parsed) return null;
    parsed.setHours(23, 59, 59, 999);
    return parsed.getTime();
}

function sessionDate(session: any, field: SessionDateField): Date | null {
    const data = session?.data || {};
    if (field === 'completed') return validDate(data.completed_at);
    return validDate(data.started_at || session?.createdAt);
}

export function dateRangeError(
    minDate?: Date | string | null,
    maxDate?: Date | string | null,
): string | null {
    if (minDate && !validDate(minDate)) return 'The start date is invalid.';
    if (maxDate && !validDate(maxDate)) return 'The end date is invalid.';
    if (minDate && maxDate && startOfDay(minDate)! > endOfDay(maxDate)!) {
        return 'The start date must be on or before the end date.';
    }
    return null;
}

export function filterSessionsByDateRange(
    sessions: any[] = [],
    options: SessionDateRangeOptions = {},
): any[] {
    const { minDate, maxDate, dateField = 'started' } = options;
    const error = dateRangeError(minDate, maxDate);
    if (error) throw new Error(error);
    if (!minDate && !maxDate) return [...sessions];

    const minTime = minDate ? startOfDay(minDate) : null;
    const maxTime = maxDate ? endOfDay(maxDate) : null;
    return sessions.filter(session => {
        const date = sessionDate(session, dateField);
        if (!date) return false;
        const timestamp = date.getTime();
        return (minTime === null || timestamp >= minTime)
            && (maxTime === null || timestamp <= maxTime);
    });
}
