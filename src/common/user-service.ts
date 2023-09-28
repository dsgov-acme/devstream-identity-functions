import { config, getUserTypeByTenant } from '../common/config';
import { client, UserResponse } from '../client/user-management-client';
import { UserRecord } from 'gcip-cloud-functions';

export async function createUserForRemote(user: UserRecord): Promise<UserResponse> {
    const userType: 'agency' | 'public' = getUserTypeByTenant(user.tenantId);
    return client.createUser({
        displayName: user.displayName || user.email,
        email: user.email,
        externalId: user.uid,
        identityProvider: config.identityProvider,
        userType
    });
}

export async function getUserFromRemote(user: UserRecord): Promise<UserResponse> {
    const apiUser: UserResponse | null = await client.getUserByExternalId(config.identityProvider, user.uid);
    if (apiUser === null) {
        return createUserForRemote(user);
    }

    return apiUser;
}