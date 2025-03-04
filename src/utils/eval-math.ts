import * as types from '@/src/types';

export function evalMath(
    condition = '',
    values: types.ScreenEntryValue[],
) {
    if (condition.toLowerCase().includes('sum')) {
        condition = condition
            .replace(/sum/gi, '')
            .replaceAll(',', '+');
    }

    if (condition.toLowerCase().includes('multiply')) {
        condition = condition
            .replace(/multiply/gi, '')
            .replaceAll(',', '*');
    }

    if (condition.toLowerCase().includes('divide')) {
        condition = condition
            .replace(/divide/gi, '')
            .replaceAll(',', '/');
    }

    if (condition.toLowerCase().includes('subtract')) {
        condition = condition
            .replace(/subtract/gi, '')
            .replaceAll(',', '-');
    }

    const getValue = (key: string, op: 'sum' | 'subtract' | 'multiply' | 'divide') => {
        key = `${key || ''}`.toLowerCase()
            .replaceAll('__', '')
            .replaceAll('_plus', '')
            .replaceAll('_minus', '')
            .replaceAll('_multiply', '')
            .replaceAll('_divide', '')
            .replaceAll('- ', '')
            .replaceAll('+ ', '')
            .replaceAll('/ ', '')
            .replaceAll('* ', '');

        const entry = values.filter(v => `${v.key}`.toLowerCase().includes(key))[0];

        const valueIsValidNumber = !entry || (entry?.value === null) || isNaN(Number(entry?.value)) ? false : true;
        let value: number | null = valueIsValidNumber ? Number(entry?.value!) : null;

        switch (op) {
            case 'sum':
                if (value === null) value = 0;
                break;

            case 'subtract':
                if (value === null) value = 0;
                break;

            case 'multiply':
                if (value === null) value = 0;
                break;

            case 'divide':
                if (value === null) value = 0;
                break;
        
            default:
                break;
        }

        return value || 0;
    };
    let parsedCondition = condition
        .replaceAll('+', ' _plus ')
        .replaceAll('-', ' _minus ')
        .replaceAll('*', ' _multiply ')
        .replaceAll('/', ' _divide ')
        .replace(/\s+/g, " ")
        .replaceAll('$', '__');

    parsedCondition = parsedCondition
        .replaceAll(' _plus ', '_plus ')
        .replaceAll(' _minus ', '_minus ')
        .replaceAll(' _multiply ', '_multiply ')
        .replaceAll(' _divide ', '_divide ')

    let parsed = parsedCondition;

    if (parsed.match(/__\w+_plus/gi)) {
        parsed.match(/__\w+_plus/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, getValue(key, 'sum') + ' +');
        })
    }

    if (parsed.match(/__\w+_minus/gi)) {
        parsed.match(/__\w+_minus/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, getValue(key, 'subtract') + ' -');
        })
    }

    if (parsed.match(/__\w+_divide/gi)) {
        parsed.match(/__\w+_divide/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, getValue(key, 'divide') + ' /');
        })
    }

    if (parsed.match(/__\w+_multiply/gi)) {
        parsed.match(/__\w+_multiply/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, getValue(key, 'multiply') + ' *');
        })
    }

    parsed = parsed.replaceAll('_minus', ' -');
    parsed = parsed.replaceAll('_plus', ' +');
    parsed = parsed.replaceAll('_multiply', ' *');
    parsed = parsed.replaceAll('_divide', ' /');

    if (parsed.match(/\+ __\w+/gi)) {
        parsed.match(/\+ __\w+/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, '+ ' + getValue(key, 'sum'));
        })
    }

    if (parsed.match(/\- __\w+/gi)) {
        parsed.match(/\- __\w+/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, '- ' + getValue(key, 'subtract'));
        })
    }

    if (parsed.match(/\* __\w+/gi)) {
        parsed.match(/\* __\w+/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, '* ' + getValue(key, 'multiply'));
        })
    }

    if (parsed.match(/\/ __\w+/gi)) {
        parsed.match(/\/ __\w+/gi)!.forEach(key => {
            parsed = parsed.replaceAll(key, '/ ' + getValue(key, 'divide'));
        })
    }

    parsed = parsed.replaceAll('/ 0', '/ 1');

    let result: number | null = null;
    let error: null | string = null;

    try {
        result = eval(parsed);
    } catch(e: any) {
        error = e.message;
    }

    return {
        expresion: parsed,
        result,
        error,
    };
}
