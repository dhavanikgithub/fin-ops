// Logger utility to handle logging based on environment

const isDevelopment = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';

type LogLevel = 'LOG' | 'WARN' | 'ERROR' | 'INFO' | 'DEBUG';

function getCallerInfo(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';

    // Get the third line of the stack (caller of logger method)
    const stackLines = stack.split('\n');
    const callerLine = stackLines[3] || stackLines[2] || '';

    // Extract file path from stack trace
    const match = callerLine.match(/\((.+):(\d+):(\d+)\)/) || callerLine.match(/at (.+):(\d+):(\d+)/);
    if (match) {
        let filePath = match[1];
        // Convert to relative path from src directory
        const srcIndex = filePath.lastIndexOf('src');
        if (srcIndex !== -1) {
            filePath = filePath.substring(srcIndex);
        } else {
            // Fallback to just filename
            filePath = filePath.split(/[/\\]/).pop() || filePath;
        }
        return `${filePath}:${match[2]}`;
    }

    return 'unknown';
}

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