import { AuthEventContext, BeforeCreateHandlerCallback, BeforeSignInHandlerCallback, UserEventUpdateRequest, UserRecord, https } from 'gcip-cloud-functions';
import { logger } from '../common/logging';
import {CORRELATION_ID_MDC_KEY, getCorrelationId, clearCorrelationId} from '../common/correlation-id';

type HandlerFunction = BeforeCreateHandlerCallback | BeforeSignInHandlerCallback;

export function wrapWithCorrelationLoggingMiddleware(handler: HandlerFunction): HandlerFunction {
    return async (user: UserRecord, context: AuthEventContext): Promise<UserEventUpdateRequest> => {
        try {
            logger.mdc[CORRELATION_ID_MDC_KEY] = getCorrelationId();
            return await handler(user, context);
        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error('There was an error initializting user.', error);
            } else {
                logger.error('There was an error initializting user.', { error });
            }

            if (error instanceof https.HttpsError) {
                throw error;
            }
        
            throw new https.HttpsError('internal', 'An unexpected error has occurred and has been logged.');
        } finally {
            clearCorrelationId();
            logger.reset();
        }
    };
}