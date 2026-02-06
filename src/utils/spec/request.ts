import { SELF, env } from 'cloudflare:test';
import { beforeAll } from 'vitest';

// Allow tests to run against an external API Worker by setting VITEST_EXTERNAL_API_URL.
export const externalApiUrl = env.VITEST_EXTERNAL_API_URL?.replace(/\/+$/, '') || null;

/**
 * Run a fetch request to the API Worker, pre-consuming the response body as test for repeat access in tests.
 *
 * @param {string} route Route to request in API Worker.
 * @param {RequestInit} [opts={}] Options to set for fetch request.
 * @return {Promise<Response>}
 */
export const request = async (route, opts = {}) => {
    const init = {
        ...opts,
        headers: {
            ...opts.headers,
            'User-Agent': 'cdnjs/vitest',
        },
    };
    const response = externalApiUrl
        ? await fetch(`${externalApiUrl}${route}`, init)
        : await SELF.fetch(`http://local${route}`, init);
    const text = await response.text();

    return new Proxy({}, {
        get: (_, prop) => {
            if (prop === 'text') {
                return () => Promise.resolve(text);
            }

            if (prop === 'json') {
                return () => Promise.resolve(JSON.parse(text));
            }

            if ([ 'clone', 'arrayBuffer', 'blob', 'bytes', 'formData' ].includes(prop)) {
                return () => Promise.reject(new Error(`Response.${prop}() is not supported in tests`));
            }

            return Reflect.get(response, prop);
        },
    });
};

/**
 * Run a fetch request to the API Worker before tests, returning a proxy to the response for use in tests.
 *
 * @param {string} route Route to request in API Worker.
 * @param {RequestInit} [opts={}] Options to set for fetch request.
 * @return {Response}
 */
export const beforeRequest = (route, opts = {}) => {
    let response;

    beforeAll(async () => {
        response = await request(route, opts);
    });

    return new Proxy({}, {
        get: (_, prop) => Reflect.get(response, prop),
    });
};
