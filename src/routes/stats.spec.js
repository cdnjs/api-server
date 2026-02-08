import { describe, it, expect } from 'vitest';

import testCors from '../utils/spec/cors.js';
import testHuman from '../utils/spec/human.js';
import { beforeRequest, request } from '../utils/spec/request.js';

describe('/stats', () => {
    describe('No query params', () => {
        // Fetch the endpoint
        const path = '/stats';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns a JSON body that is a stats object', () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);
            expect(response.body).to.be.an('object');
        });
        describe('cdnjs stats object', () => {
            it('is an object with the \'libraries\' property', () => {
                expect(response.body).to.have.property('libraries').that.is.an('number');
            });
            it('has no other properties', () => {
                expect(Object.keys(response.body)).to.have.lengthOf(1);
            });
        });

        // Test with a trailing slash
        it('responds to requests with a trailing slash', async () => {
            const res = await request(path + '/');
            expect(res.status).to.eq(200);
            expect(res.body).to.deep.equal(response.body);
        });
    });

    describe('Requesting human response (?output=human)', () => {
        // Fetch the endpoint
        const path = '/stats?output=human';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // 6 hours
        });
        testHuman(response);
    });
});
