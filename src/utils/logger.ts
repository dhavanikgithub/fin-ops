// Logger utility to handle logging based on environment

const isDevelopment = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging';

type LogLevel = 'LOG' | 'WARN' | 'ERROR' | 'INFO' | 'DEBUG';

function formatLogMessage(level: LogLevel, ...args: any[]): string {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');

    return `[${timestamp}] [${level}] ${message}`;
}

const logger = {
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(formatLogMessage('LOG', ...args));
        }
    },
    info: (...args: any[]) => {
        if (isDevelopment) {
            console.info(formatLogMessage('INFO', ...args));
        }
    },
    warn: (...args: any[]) => {
        if (isDevelopment) {
            console.warn(formatLogMessage('WARN', ...args));
        }
    },
    error: (...args: any[]) => {
        if (isDevelopment) {
            console.error(formatLogMessage('ERROR', ...args));
        }
    },
    debug: (...args: any[]) => {
        if (isDevelopment) {
            console.debug(formatLogMessage('DEBUG', ...args));
        }
    },
};

export default logger;