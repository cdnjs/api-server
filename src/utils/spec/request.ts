import { env, exports } from 'cloudflare:workers';
import { afterAll, beforeAll } from 'vitest';

// Allow tests to run against an external API Worker by setting VITEST_EXTERNAL_API_URL.
export const externalApiUrl =
    // @ts-expect-error - This is injected by Miniflare in the Vitest config.
    env.VITEST_EXTERNAL_API_URL?.replace(/\/+$/, '') || null;

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
        : await exports.default.fetch(`http://local${route}`, init);
    const text = await response.text();

    return new Proxy({} as Response, {
        get: (_, prop) => {
            if (prop === 'text') {
                return () => Promise.resolve(text);
            }

            if (prop === 'json') {
                return () => Promise.resolve(JSON.parse(text));
            }

            if (
                typeof prop === 'string' &&
                ['clone', 'arrayBuffer', 'blob', 'bytes', 'formData'].includes(
                    prop,
                )
            ) {
                return () =>
                    Promise.reject(
                        new Error(
                            `Response.${prop}() is not supported in tests`,
                        ),
                    );
            }

            return Reflect.get(response, prop, response);
        },
    });
};

/**
 * Run a fetch request to the API Worker before tests, returning a proxy to the response for use in tests.
 *
 * @param route Route to request in API Worker.
 * @param opts Options to set for fetch request.
 * @param website Whether to set WEBSITE_BASE to simulate the website React output.
 */
export const beforeRequest = (
    route: string,
    opts: RequestInit = {},
    website = false,
) => {
    let response: Response;
    let base: string;

    beforeAll(
        async () => {
            if (website) {
                base = env.WEBSITE_BASE;
                env.WEBSITE_BASE = 'http://local';
            }

            response = await request(route, opts);
        },
        // Allow time for the worker to compile when running against the Miniflare instance
        externalApiUrl ? 5_000 : 30_000,
    );

    if (website) {
        afterAll(() => {
            env.WEBSITE_BASE = base;
        });
    }

    return new Proxy({} as Response, {
        get: (_, prop) => Reflect.get(response, prop, response),
    });
};
