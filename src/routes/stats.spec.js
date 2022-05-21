import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import request from '../utils/spec/request.js';
import testCors from '../utils/spec/cors.js';
import testHuman from '../utils/spec/human.js';

describe('/stats', () => {
    describe('No query params', () => {
        // Define endpoint info
        const path = '/stats';
        const fetch = () => request(path);

        // Fetch the endpoint
        let response;
        before('fetch endpoint', () => fetch().then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
        });
        it('returns a JSON body that is a stats object', () => {
            expect(response).to.be.json;
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
    });

    describe('Requesting human response (?output=human)', () => {
        // Define endpoint info
        const path = '/stats?output=human';
        const fetch = () => request(path);

        // Fetch the endpoint
        let response;
        before('fetch endpoint', () => fetch().then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
        });
        testHuman(() => response);
    });
});
