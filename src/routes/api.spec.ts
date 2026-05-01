import { describe, expect, it } from 'vitest';

import testCors from '../utils/spec/cors.ts';
import { beforeRequest, request } from '../utils/spec/request.ts';

import type { OpenApiResponse } from './api.schema.ts';

describe('/api', () => {
    // Fetch the endpoint
    const path = '/api';
    const response = beforeRequest(path);

    // Test the endpoint
    testCors(path, response);
    it('returns the correct Cache headers', () => {
        expect(response.headers.get('Cache-Control')).to.eq(
            'public, max-age=21600',
        ); // 6 hours
    });
    it('returns the correct status code', () => {
        expect(response.status).to.eq(200);
    });
    it('returns a valid OpenAPI spec in JSON format', async () => {
        expect(response.headers.get('Content-Type')).to.match(
            /application\/json/,
        );
        const data = await response.json<OpenApiResponse>();
        expect(data.openapi).to.eq('3.0.0');
        expect(data.info.title).to.eq('cdnjs API');
        expect(data.paths['/libraries']).to.be.an('object');
        expect(data.paths['/libraries/{library}']).to.be.an('object');
        expect(data.components?.schemas?.Error).to.be.an('object');
    });

    // Test with a trailing slash
    it('responds to requests with a trailing slash', async () => {
        const res = await request(path + '/');
        expect(res.status).to.eq(200);
        const resData = await res.json();
        const responseData = await response.json();
        expect(resData).to.deep.eq(responseData);
    });
});
