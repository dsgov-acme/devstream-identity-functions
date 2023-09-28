import { Auth, AuthEventContext, UserEventUpdateRequest, UserRecord } from 'gcip-cloud-functions';
import { logger } from '../common/logging';
import { UserResponse } from '../client/user-management-client';
import { createUserForRemote } from '../common/user-service';

const authClient = new Auth();

export async function beforeCreateHandler(user: UserRecord, context: AuthEventContext): Promise<UserEventUpdateRequest> {
    logger.mdc.user = user;
    logger.mdc.context = context;

    const response: UserResponse = await createUserForRemote(user);

    logger.info(`User with type=${response.userType}, email=${user.email} and externalId=${user.uid} created with application user ID: ${response.id}`);

    return {};
}
