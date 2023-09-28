import fetch from 'node-fetch';
import { config } from '../common/config';
import { getAuthToken } from '../common/auth';
import { logger } from '../common/logging';
import {CORRELATION_ID_HTTP_HEADER, getCorrelationId} from '../common/correlation-id';
import { URLSearchParams } from 'url';

export type UserCreateRequest = {
    displayName: string,
    email: string,
    externalId: string,
    identityProvider: string,
    userType: 'agency' | 'public'
};

export type UserResponse = UserCreateRequest & {
    id: string
};

type PagingMetadata = {
    totalCount: number,
    pageSize: number,
    pageNumber: number,
    nextPage: string | null
};

type UserSearchResult = {
    users: Array<UserResponse>,
    pagingMetadata: PagingMetadata
};

class UserManagementClient {
    async createUser(request: UserCreateRequest): Promise<UserResponse> {
        logger.info('Calling create user with', { request });
        const response = await fetch(`${config.userManagementBaseUrl}/api/v1/users`, {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
                [CORRELATION_ID_HTTP_HEADER]: getCorrelationId()
            }
        });
        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Error creating user. status=${response.status}, body=${body}`);
        }
        const data = await response.json();
        return data as UserResponse;
    }

    async getUserByExternalId(identityProvider: string, externalId: string): Promise<UserResponse | null> {
        const paramters: Record<string, string> = { identityProvider, externalId };
        const response = await fetch(`${config.userManagementBaseUrl}/api/v1/users?${new URLSearchParams(paramters)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
                [CORRELATION_ID_HTTP_HEADER]: getCorrelationId()
            }
        });
        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Error fetching user. status=${response.status}, body=${body}`);
        }
        const result = await response.json() as UserSearchResult;
        logger.debug('Results of user lookup', { result });

        const resultCount = result.pagingMetadata.totalCount;
        if (resultCount === 0) {
            return null;
        }
        if (resultCount > 1) {
            throw new Error(`User search by identityProvider/externalId returned ${resultCount} results, when at most 1 was expected.`);
        }

        logger.debug('Returning user', { userResult: result.users[0] });

        return result.users[0];
    }
}

export const client = new UserManagementClient();