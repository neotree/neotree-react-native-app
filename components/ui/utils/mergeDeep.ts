export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function _mergeDeep<T = any>(target, ...sources): T {
    if (!sources.length) return target;
    let source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                _mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    
    return _mergeDeep(target, ...sources);
}

export function mergeDeep<T = any>(...sources): T {
    sources = [...sources];
    return _mergeDeep<T>({}, ...sources);
}
