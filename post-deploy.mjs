import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
    scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase',
    ],
});
const authClient = await auth.getClient();
const projectId = await auth.getProjectId();
const region = process.env.GCP_REGION || 'us-east4';

const data = {
    blockingFunctions: {
        triggers: {
            beforeCreate: {
                functionUri: `https://${region}-${projectId}.cloudfunctions.net/gcip-before-create`,
            },
            beforeSignIn: {
                functionUri: `https://${region}-${projectId}.cloudfunctions.net/gcip-before-signin`,
            },
        },
    },
};

await authClient.request({
    url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=blockingFunctions.triggers`,
    method: 'PATCH',
    data,
});
