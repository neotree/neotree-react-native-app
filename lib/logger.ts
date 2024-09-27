function loggerFn(
    type: 'log' | 'error',
    ...args: any[]
) {
    if (__DEV__) {
        const logger = type === 'error' ? console.error : console.log;
        logger(...args);
    }

    if (type === 'error') {
        // TODO: Report error
    }
}

const logger = {
    log: (...args: any[]) => loggerFn('log', ...args),
    error: (...args: any[]) => loggerFn('error', ...args),
};

export default logger;
