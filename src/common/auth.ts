import crypto, { KeyObject } from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import cache from 'memory-cache';
import { config } from './config';

const key: KeyObject = crypto.createPrivateKey(config.jwtPrivateKey);

export function getAuthToken() {
    var token: string = cache.get('token');
    if (!token) {
        token = generateToken();
        cache.put('token', token, 180_000); // cache for 3 minutes
    }

    return token;
}

function generateToken(): string {
    const payload = {
        roles: [
            'um:identity-client'
        ]
    };
    const options: SignOptions = {
        algorithm: 'RS256',
        expiresIn: '5m',
        issuer: config.jwtIssuer,
        subject: 'dsgov-identity-functions'
    };
    return jwt.sign(payload, key, options);
}