import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before } from 'mocha';

import testCors from '../utils/spec/cors.js';
import testHuman from '../utils/spec/human.js';
import request from '../utils/spec/request.js';

chai.use(chaiHttp);

describe('/this-route-doesnt-exist', () => {
    describe('No query params', () => {
        // Define endpoint info
        const path = '/this-route-doesnt-exist';
        const fetch = () => request(path);

        // Fetch the endpoint
        let response;
        before('fetch endpoint', () => fetch().then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
        });
        it('returns the correct status code', () => {
            expect(response).to.have.status(404);
        });
        it('returns a JSON body that is a valid error response', () => {
            expect(response).to.be.json;
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('error', true);
            expect(response.body).to.have.property('status', 404);
            expect(response.body).to.have.property('message', 'Endpoint not found');
        });
    });

    describe('Requesting human response (?output=human)', () => {
        // Define endpoint info
        const path = '/this-route-doesnt-exist?output=human';
        const fetch = () => request(path);

        // Fetch the endpoint
        let response;
        before('fetch endpoint', () => fetch().then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
        });
        testHuman(() => response);
    });
});

describe('/error', () => {
    describe('No query params', () => {
        // Define endpoint info
        const path = '/error';
        const fetch = () => request(path);

        // Fetch the endpoint
        let response;
        before('fetch endpoint', () => fetch().then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Expires', '0');
            expect(response).to.have.header('Pragma', 'no-cache');
            expect(response).to.have.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        });
        it('returns the correct status code', () => {
            expect(response).to.have.status(500);
        });
        it('returns a JSON body that is a valid error response', () => {
            expect(response).to.be.json;
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('error', true);
            expect(response.body).to.have.property('status', 500);
            expect(response.body).to.have.property('message', 'Test error');
        });
    });

    describe('Requesting human response (?output=human)', () => {
        // Define endpoint info
        const path = '/error?output=human';
        const fetch = () => request(path);

        // Fetch the endpoint
        let response;
        before('fetch endpoint', () => fetch().then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Expires', '0');
            expect(response).to.have.header('Pragma', 'no-cache');
            expect(response).to.have.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        });
        testHuman(() => response);
    });
});
