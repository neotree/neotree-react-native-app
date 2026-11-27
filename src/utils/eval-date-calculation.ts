import moment from 'moment';
import * as types from '@/src/types';
import { evaluateArithmetic } from '@/src/utils/safe-math';
import { parseDateLikeValue } from '@/src/utils/date-value-normalization';
import { findEntry, isEmptyValue, splitTopLevelArgs, unwrapCall } from '@/src/utils/calculation-utils';

/**
 * Date calculations, as stored by the editor (neotree-editor/lib/conditional-expression/calculation.ts):
 *
 *   DATE_ADD(<date>, <whole number>, 'days' | 'weeks' | 'months' | 'years')   nestable
 *   DATE_FIRST(a, b, ...)   the first option that has a value
 *
 * <date> is a $Key, a DATE_ADD(...) or a DATE_FIRST(...). The amount is a number, a $Key or
 * simple arithmetic over them. Months and years are calendar steps that clamp to the end of
 * the month (31 Jan + 1 month = 28/29 Feb), which is moment's behaviour. Days and weeks are
 * local calendar days, so a daylight-saving change never shifts the time of day.
 *
 * Nothing is evaluated as code: formulas are split and parsed here, and the amount goes
 * through the same restricted arithmetic parser as MATH(...).
 */

const UNITS = ['days', 'weeks', 'months', 'years'] as const;
type Unit = typeof UNITS[number];

const MIN_YEAR = 1900;
const MAX_YEAR = 2200;

/**
 * The calculation worked but landed on a date no clinical form should hold. This is a data or
 * formula mistake rather than a missing value, so DATE_FIRST does not skip past it to a fallback.
 */
export class DateOutOfRangeError extends Error {
    constructor(public readonly date: Date) {
        super(`The calculated date is outside ${MIN_YEAR}-${MAX_YEAR}`);
    }
}

export const DATE_RANGE = { minYear: MIN_YEAR, maxYear: MAX_YEAR };

/** A value an option needs is missing or invalid, so FIRST/DATE_FIRST moves to the next option. */
class NoValueError extends Error {}

export const isDateCalculation = (formula?: string | null) =>
    /^\s*(DATE_ADD|DATE_FIRST)\(/.test(`${formula ?? ''}`);

function readNumber(text: string, values: types.ScreenEntryValue[]): number {
    const substituted = text.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_m, key: string) => {
        const entry = findEntry(values, key);
        const raw = entry?.type == 'period' ? entry?.exportValue : entry?.value;
        if (isEmptyValue(raw) || !Number.isFinite(Number(raw))) throw new NoValueError(`No value for $${key}`);
        return `(${Number(raw)})`;
    });
    const n = evaluateArithmetic(substituted);
    if (!Number.isFinite(n)) throw new Error('The amount is not a valid number');
    return n;
}

function evaluateDate(formula: string, values: types.ScreenEntryValue[]): Date {
    const text = formula.trim();

    const first = unwrapCall(text, 'DATE_FIRST');
    if (first !== null) {
        const options = splitTopLevelArgs(first).filter(Boolean);
        if (options.length < 2) throw new Error('DATE_FIRST needs at least 2 options');
        for (const option of options) {
            try {
                return evaluateDate(option, values);
            } catch (e) {
                if (e instanceof DateOutOfRangeError) throw e; // surfaced, never hidden behind a fallback
                // any other failure (empty, invalid, broken) skips to the next option
            }
        }
        throw new NoValueError('No option has a value');
    }

    const add = unwrapCall(text, 'DATE_ADD');
    if (add !== null) {
        const args = splitTopLevelArgs(add);
        if (args.length !== 3) throw new Error('DATE_ADD takes a date, a whole number and a unit');
        const unit = args[2].replace(/^['"]|['"]$/g, '') as Unit;
        if (!UNITS.includes(unit)) throw new Error(`Unknown unit ${args[2]}`);
        const base = evaluateDate(args[0], values);
        const amount = readNumber(args[1], values);
        if (!Number.isInteger(amount)) throw new Error('The amount must be a whole number');
        const result = moment(base).add(amount, unit).toDate();
        if (isNaN(result.getTime())) throw new Error('The result is not a valid date');
        // A date that is valid for JavaScript but absurd for a clinical form (a mistyped amount).
        if (result.getFullYear() < MIN_YEAR || result.getFullYear() > MAX_YEAR) {
            throw new DateOutOfRangeError(result);
        }
        return result;
    }

    const key = /^\$([A-Za-z_][A-Za-z0-9_]*)$/.exec(text)?.[1];
    if (key) {
        const entry = findEntry(values, key);
        const date = entry ? parseDateLikeValue(entry.value, entry.type) : null;
        if (!date) throw new NoValueError(`No date for $${key}`);
        return date;
    }

    throw new Error('Invalid date formula');
}

export function evalDateCalculation(
    formula = '',
    values: types.ScreenEntryValue[],
): { result: Date | null; error: string | null; outOfRange?: Date } {
    try {
        return { result: evaluateDate(formula, values), error: null };
    } catch (e: any) {
        if (e instanceof DateOutOfRangeError) return { result: null, error: e.message, outOfRange: e.date };
        return { result: null, error: e?.message || 'Invalid date formula' };
    }
}
