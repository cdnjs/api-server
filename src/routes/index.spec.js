import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before } from 'mocha';

import testCors from '../utils/spec/cors.js';
import request from '../utils/spec/request.js';

chai.use(chaiHttp);

describe('/', () => {
    // Fetch the endpoint
    const path = '/';
    let response;
    before('fetch endpoint', () => request(path, { redirect: 'manual' }).then(res => { response = res; }));

    // Test the endpoint
    testCors(path, () => response);
    it('returns the correct Cache headers', () => {
        expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
    });
    it('redirects to the cdnjs.com API docs as a 301', () => {
        expect(response).to.have.status(301);
        expect(response).to.redirectTo('https://cdnjs.com/api');
    });
});

describe('/health', () => {
    // Fetch the endpoint
    const path = '/health';
    let response;
    before('fetch endpoint', () => request(path).then(res => { response = res; }));

    // Test the endpoint
    testCors(path, () => response);
    it('returns the correct Cache headers', () => {
        expect(response).to.have.header('Expires', '0');
        expect(response).to.have.header('Pragma', 'no-cache');
        expect(response).to.have.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    });
    it('returns the correct status code', () => {
        expect(response).to.have.status(200);
    });
    it('returns on OK message', () => {
        expect(response).to.be.text;
        expect(response.text).to.eq('OK');
    });

    // Test with a trailing slash
    it('responds to requests with a trailing slash', async () => {
        const res = await request(path + '/');
        expect(res).to.have.status(200);
        expect(res.text).to.eq(response.text);
    });
});

describe('/robots.txt', () => {
    // Fetch the endpoint
    const path = '/robots.txt';
    let response;
    before('fetch endpoint', () => request(path).then(res => { response = res; }));

    // Test the endpoint
    testCors(path, () => response);
    it('returns the correct Cache headers', () => {
        expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
    });
    it('returns the correct status code', () => {
        expect(response).to.have.status(200);
    });
    it('disallows all indexing', () => {
        expect(response).to.be.text;
        expect(response.text).to.eq('User-agent: *\nDisallow: /');
    });
});
