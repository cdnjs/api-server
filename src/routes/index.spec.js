import { describe, it, before } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import request from '../utils/spec/request.js';
import testCors from '../utils/spec/cors.js'

chai.use(chaiHttp);

describe('/', () => {
    // Define endpoint info
    const path = '/';
    const fetch = () => request(path, { redirect: 'manual' });

    // Fetch the endpoint
    let response;
    before('fetch endpoint', () => fetch().then(res => { response = res; }));

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
    // Define endpoint info
    const path = '/health';
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
        expect(response).to.have.status(200);
    });
    it('returns on OK message', () => {
        expect(response).to.be.text;
        expect(response.text).to.eq('OK');
    });
});

describe('/robots.txt', () => {
    // Define endpoint info
    const path = '/robots.txt';
    const fetch = () => request(path);

    // Fetch the endpoint
    let response;
    before('fetch endpoint', () => fetch().then(res => { response = res; }));

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
