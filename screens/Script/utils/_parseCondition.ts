const sanitizeCondition = (condition = '') => {
    let sanitized = condition
        .replace(new RegExp(' and ', 'gi'), ' && ')
        .replace(new RegExp(' or ', 'gi'), ' || ')
        .replace(new RegExp(' = ', 'gi'), ' == ');
    sanitized = sanitized.split(' ')
        .map(s => s[0] === '$' ? `'${s}'` : s).join(' ');
    return sanitized;
};

const parseConditionString = (condition = '', _key = '', value) => {
    const s = (condition || '').toLowerCase().split('$').join(' $');
    const key = (_key || '').toLowerCase();
    const parsed = s.replace(/\s\s+/g, ' ')
        .split(`$${key} =`).join(`${value} =`)
        .split(`$${key}=`).join(`${value} =`)
        .split(`$${key} >`).join(`${value} >`)
        .split(`$${key}>`).join(`${value} >`)
        .split(`$${key} <`).join(`${value} <`)
        .split(`$${key}<`).join(`${value} <`)
        .split(`$${key}!`).join(`${value} !`)
        .split(`$${key} !`).join(`${value} !`);
    return parsed;
};

export type ParseConditionParams = {
    entries?: any;
    configuration?: any;
    condition: string;
};

export function parseCondition(condition: string, {
    configuration,
    entries
}: ParseConditionParams): string {  
    entries = entries || [];
    configuration = { ...configuration };
    const _condition = (condition || '').toString();

    const _form = entries;

    const parseValue = (condition, { value, type, key, dataType, }) => {
        value = ((value === null) || (value === undefined)) ? 'no value' : value;
        const t = dataType || type;

        switch (t) {
        // case 'number':
        //   value = value || null;
        //   break;
        case 'boolean':
            value = value === 'false' ? false : Boolean(value);
            break;
        default:
            value = JSON.stringify(value);
        }

        return parseConditionString(condition, key, value);
    };

    let parsedCondition = _form.reduce((condition, { screen, values }) => {
        values = (values || []).filter(e => (e.value !== null) || (e.value !== undefined));
        values = values.reduce((acc, e) => [
        ...acc,
        ...(e.value && e.value.map ? e.value : [e]),
        ], []);

        let c = values.reduce((acc, v) => parseValue(acc, v), condition);

        if (screen) {
        let chunks = [];
        switch (screen.type) {
            case 'multi_select':
            chunks = values.map(v => parseValue(condition, v)).filter(c => c !== condition);
            c = (chunks.length > 1 ? chunks.map(c => `(${c})`) : chunks).join(' || ');
            break;
            default:
            // do nothing
        }
        }

        return c || condition;
    }, _condition);

    if (configuration) {
        parsedCondition = Object.keys(configuration).reduce((acc, key) => {
        return parseConditionString(acc, key, configuration[key] ? true : false);
        }, parsedCondition);
    }

    return sanitizeCondition(parsedCondition);
};
