import { parseFieldItems, parseFieldValues } from './script-fields-and-items';

type FieldOption = ReturnType<typeof parseFieldItems>[number];

const OUTCOME_KEY = 'neotreeoutcome';

export function isNeoTreeOutcomeField(field: any) {
    return `${field?.key ?? ''}`.trim().toLowerCase() === OUTCOME_KEY;
}

export function isBidStillBirthOutcomeOption(option: Partial<FieldOption>) {
    const text = `${option?.label ?? ''} ${option?.value ?? ''}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

    return /\bbid\b/.test(text)
        || text.includes('brought in dead')
        || text.includes('still birth')
        || text.includes('stillbirth');
}

export function getFieldOptions(field: any): FieldOption[] {
    if (!field?.items) {
        return parseFieldValues({
            values: field?.values,
            options: field?.valuesOptions,
        });
    }

    return parseFieldItems({ items: field.items });
}

export function getBidStillBirthOutcomeOptions(field: any) {
    return getFieldOptions(field).filter(isBidStillBirthOutcomeOption);
}

export function hasBidStillBirthOutcomeOptions(screens: any[] = []) {
    return screens.some(screen => (
        screen?.data?.metadata?.fields || []
    ).some((field: any) => (
        isNeoTreeOutcomeField(field) && getBidStillBirthOutcomeOptions(field).length > 0
    )));
}

export function filterFieldToBidStillBirthOptions(field: any) {
    if (!isNeoTreeOutcomeField(field)) return field;

    if (Array.isArray(field?.items)) {
        return {
            ...field,
            items: field.items.filter((item: any) => isBidStillBirthOutcomeOption(item)),
        };
    }

    const values = `${field?.values ?? ''}`.split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .filter(line => {
            const [value, label] = line.split(',');
            return isBidStillBirthOutcomeOption({ value, label });
        })
        .join('\n');

    return {
        ...field,
        values,
    };
}
