import { expect } from 'chai';
import { before, it } from 'mocha';

import corsOptions from '../cors.js';

import request from './request.js';


/**
 * Check that a response (and request if OPTIONS) has the expects CORS header values.
 *
 * @param {import('./request.js').ExtendedResponse} response Response (and request) to test.
 */
const expectCORSHeaders = response => {
    expect(response).to.have.header('Access-Control-Allow-Origin', corsOptions.origin);
    expect(response).to.have.header('Access-Control-Allow-Credentials', corsOptions.credentials.toString());

    // Testing allowed methods and headers only makes sense in case of options
    if (response.request.method.toLowerCase() === 'options') {
        expect(response).to.have.header('Access-Control-Allow-Headers', corsOptions.allowHeaders.join(','));
        expect(response).to.have.header('Access-Control-Allow-Methods', corsOptions.allowMethods.join(','));
    }
};

/**
 * Run Mocha tests to ensure a path returns correct CORS headers.
 *
 * @param {string} path Request path to test for CORS headers.
 * @param {function(): import('./request.js').ExtendedResponse} getResponse Method that returns main path response.
 */
export default (path, getResponse) => {
    // Fetch the endpoint
    let optionsResponse;
    before('fetch endpoint (OPTIONS)', () => request(path, { method: 'OPTIONS', redirect: 'manual' })
        .then(res => { optionsResponse = res; }));

    it('returns the correct CORS headers', () => {
        expectCORSHeaders(getResponse());
    });

    it('returns the correct status code for OPTIONS request', () => {
        expect(optionsResponse).to.have.status(204);
    });

    it('returns the correct CORS headers for OPTIONS request', () => {
        expectCORSHeaders(optionsResponse);
    });
};
