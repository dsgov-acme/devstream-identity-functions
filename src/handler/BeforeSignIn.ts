import { AuthEventContext, UserEventUpdateRequest, UserRecord } from 'gcip-cloud-functions';
import { logger } from '../common/logging';
import { getUserFromRemote } from '../common/user-service';
import { UserResponse } from '../client/user-management-client';

// TODO replace with call to user-management once role management is implemented.
const hardCodedRoles: Record<string, string[]> = {
    agency: [
        'as:event-reader',
        'dm:document-reviewer',
        'dm:document-uploader',
        'um:reader',
        'um:admin',
        'wm:transaction-admin',
        'wm:transaction-config-admin',
        'ns:notification-admin'
    ],
    public: [
        'dm:document-uploader',
        'um:basic',
        'wm:transaction-submitter'
    ]
};

export async function beforeSignInHandler(user: UserRecord, context: AuthEventContext): Promise<UserEventUpdateRequest> {
    logger.mdc.user = user;
    logger.mdc.context = context;

    logger.info('User has logged in.');

    let apiUser: UserResponse = await getUserFromRemote(user);

    return {
        sessionClaims: {
            application_user_id: apiUser.id,
            roles: hardCodedRoles[apiUser.userType] || [],
			user_type: apiUser.userType
        }
    }
}
