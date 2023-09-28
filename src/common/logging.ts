import { createLogger, transports, format}  from 'winston';

const internalLogger = createLogger({
    level: 'info',
    format: format.combine(format.errors({ stack: true }),format.json()),
    transports: [
        new transports.Console()
    ]
});

class CustomLogger {
    mdc: Record<string, any>;

    constructor() {
        this.mdc = {};
    }

    public debug(message: string, meta: object = {}): void {
        internalLogger.debug(message, {...this.mdc, ...meta});
    }

    public info(message: string, meta: object = {}): void {
        internalLogger.info(message, {...this.mdc, ...meta});
    }

    public warn(message: string, meta: object = {}): void {
        internalLogger.warn(message, {...this.mdc, ...meta});
    }

    public error(message: string, error: Error): void;
    public error(message: string, error: Error, meta: Record<string, unknown>): void;
    public error(message: string, meta: Record<string, unknown>): void;
    public error(message: string, errorOrMeta: Error | Record<string, unknown> = {}, meta: Record<string, unknown> = {}): void {
        if (errorOrMeta instanceof Error) {
            const { stack } = errorOrMeta;
            internalLogger.error(message, { ...this.mdc, ...meta, stacktrace: stack });
      
            return;
        }
      
        internalLogger.error(message, { ...this.mdc, ...errorOrMeta });
    }

    public reset(): void {
        this.mdc = {};
    }
}

export const logger = new CustomLogger();
