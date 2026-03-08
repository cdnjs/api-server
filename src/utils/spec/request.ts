import { SELF, env } from 'cloudflare:test';
import { beforeAll } from 'vitest';

// Allow tests to run against an external API Worker by setting VITEST_EXTERNAL_API_URL.
export const externalApiUrl = env.VITEST_EXTERNAL_API_URL?.replace(/\/+$/, '') || null;

/**
 * Run a fetch request to the API Worker, pre-consuming the response body as test for repeat access in tests.
 *
 * @param route Route to request in API Worker.
 * @param opts Options to set for fetch request.
 */
export const request = async (route: string, opts: RequestInit = {}) => {
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

    return new Proxy({} as Response, {
        get: (_, prop) => {
            if (prop === 'text') {
                return () => Promise.resolve(text);
            }

            if (prop === 'json') {
                return () => Promise.resolve(JSON.parse(text));
            }

            if (typeof prop === 'string' && [ 'clone', 'arrayBuffer', 'blob', 'bytes', 'formData' ].includes(prop)) {
                return () => Promise.reject(new Error(`Response.${prop}() is not supported in tests`));
            }

            return Reflect.get(response, prop);
        },
    });
};

/**
 * Run a fetch request to the API Worker before tests, returning a proxy to the response for use in tests.
 *
 * @param route Route to request in API Worker.
 * @param opts Options to set for fetch request.
 */
export const beforeRequest = (route: string, opts: RequestInit = {}) => {
    let response: Response;

    beforeAll(async () => {
        response = await request(route, opts);
    });

    return new Proxy({} as Response, {
        get: (_, prop) => Reflect.get(response, prop),
    });
};
