const GCP_PROJECT: string = process.env.GCP_PROJECT || '';
const AGENCY_TENANT_ID: string = process.env.AGENCY_TENANT_ID || '';
const PUBLIC_TENANT_ID: string = process.env.PUBLIC_TENANT_ID || '';
const JWT_ISSUER: string = process.env.JWT_ISSUER || 'dsgov';
const JWT_PRIVATE_KEY: string = process.env.JWT_PRIVATE_KEY || '';
const USER_MANAGEMENT_BASE_URL: string = process.env.USER_MANAGEMENT_BASE_URL || '';

export const config = {
    gcpProject: GCP_PROJECT,
    identityProvider: `https://securetoken.google.com/${GCP_PROJECT}`,
    agencyTenantId: AGENCY_TENANT_ID,
    publicTenantId: PUBLIC_TENANT_ID,
    jwtIssuer: JWT_ISSUER,
    jwtPrivateKey: JWT_PRIVATE_KEY,
    userManagementBaseUrl: USER_MANAGEMENT_BASE_URL
};

export function getUserTypeByTenant(tenantId: string | null | undefined): 'agency' | 'public' {
    if (tenantId === AGENCY_TENANT_ID) {
            return 'agency';
    }

    if (tenantId === PUBLIC_TENANT_ID) {
        return 'public';
    }

    throw new Error(`The provided tenantId (${tenantId}) is not configured for this instance.`);
}