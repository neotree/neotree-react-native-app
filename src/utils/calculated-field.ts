import { isDateCalculation } from '@/src/utils/eval-date-calculation';

/**
 * A number or date whose value comes from a calculation (set on the field in the editor). The app works
 * it out from the other answers, so the person filling the form can't type over it: it changes only when
 * the answers it is calculated from change.
 *
 * A number field is calculated when it has any calculation. A date field only when the calculation is a
 * date one (DATE_ADD / DATE_FIRST), the same test the date field uses to work the value out, so a field
 * is never locked without a value being produced for it.
 */
export function isCalculatedNumberField(field?: { calculation?: unknown } | null): boolean {
    return `${field?.calculation ?? ''}`.trim().length > 0;
}

export function isCalculatedDateField(field?: { calculation?: unknown } | null): boolean {
    const calculation = `${field?.calculation ?? ''}`.trim();
    return calculation.length > 0 && isDateCalculation(calculation);
}
