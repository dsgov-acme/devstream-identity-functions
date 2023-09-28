import { UUID, randomUUID } from 'crypto';

let correlationId: UUID | null = null;

export const CORRELATION_ID_MDC_KEY = 'correlation-id';
export const CORRELATION_ID_HTTP_HEADER = 'X-Correlation-Id';

export function getCorrelationId(): UUID {
    if (correlationId === null) {
        correlationId = randomUUID();
    }

    return correlationId;
}

export function clearCorrelationId(): void {
    correlationId = null;
}
