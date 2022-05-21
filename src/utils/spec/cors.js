import { it } from 'mocha';
import { expect } from 'chai';
import request from './request.js';
import corsOptions from '../cors.js';

const expectCORSHeaders = response => {
    expect(response).to.have.header('Access-Control-Allow-Origin', corsOptions.origin);
    expect(response).to.have.header('Access-Control-Allow-Credentials', corsOptions.credentials.toString());

    // Testing allowed methods and headers only makes sense in case of options
    if (response.request.method.toLowerCase() === 'options') {
        expect(response).to.have.header('Access-Control-Allow-Headers', corsOptions.allowHeaders.join(','));
        expect(response).to.have.header('Access-Control-Allow-Methods', corsOptions.allowMethods.join(','));
    }
};

export default (path, getResponse) => {
    it('returns the correct CORS headers', () => {
        const response = getResponse();
        expectCORSHeaders(response);
    });

    it('returns the correct CORS headers for OPTIONS request',
        () => request(path, { method: 'OPTIONS', redirect: 'manual' }).then(response => {
            expectCORSHeaders(response);
        }));
};
