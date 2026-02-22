import { it, expect } from 'vitest';

import corsOptions from '../cors.ts';

import { beforeRequest } from './request.ts';

/**
 * Run tests to ensure a path returns correct CORS headers.
 *
 * @param {string} path Request path to test for CORS headers.
 * @param {Response} response Response from the API worker to test for CORS headers.
 */
export default (path, response) => {
    // Fetch the endpoint
    const optionsResponse = beforeRequest(path, { method: 'OPTIONS', redirect: 'manual' });

    it('returns the correct CORS headers', () => {
        expect(response.headers.get('Access-Control-Allow-Origin')).to.eq(corsOptions.origin);
        expect(response.headers.get('Access-Control-Allow-Credentials')).to.eq(corsOptions.credentials.toString());
    });

    it('returns the correct status code for OPTIONS request', () => {
        expect(optionsResponse.status).to.eq(204);
    });

    it('returns the correct CORS headers for OPTIONS request', () => {
        expect(optionsResponse.headers.get('Access-Control-Allow-Origin')).to.eq(corsOptions.origin);
        expect(optionsResponse.headers.get('Access-Control-Allow-Credentials')).to.eq(corsOptions.credentials.toString());
        expect(optionsResponse.headers.get('Access-Control-Allow-Headers')).to.eq(corsOptions.allowHeaders.join(','));
        expect(optionsResponse.headers.get('Access-Control-Allow-Methods')).to.eq(corsOptions.allowMethods.join(','));
    });
};
