import { fileURLToPath } from 'node:url';

import { Miniflare, Request } from 'miniflare';

let mf;

/**
 * @typedef {Response} ExtendedResponse
 * @property {function(string): string|undefined} getHeader Method to access a header (alias to headers.get).
 * @property {Request} request Request that was sent to fetch the response.
 * @property {string} text Text content from the response.
 * @property {ReadableStream|*} body Body content from the response (parsed JSON if response declared as JSON).
 */

/**
 * Dispatch a fetch request to Miniflare.
 *
 * @param {string} route Route to request in API via Miniflare.
 * @param {RequestInit} [opts={}] Options to set for fetch request.
 * @param {function(Miniflare, Request): (Promise<void>|void)} [preHook] Hook to run before the request is sent.
 * @param {function(Miniflare, Request, ExtendedResponse): (Promise<void>|void)} [postHook] Hook to run after the response is received.
 * @return {Promise<ExtendedResponse>}
 */
export default async (route, opts = {}, preHook = undefined, postHook = undefined) => {
    // Create the Miniflare instance
    if (!mf) {
        mf = new Miniflare({
            modules: [ { type: 'ESModule', path: fileURLToPath(new URL('../../../dist-worker/index.js', import.meta.url)) } ],
            kvNamespaces: [ 'CACHE' ],
            bindings: {
                DISABLE_CACHING: false,
                METADATA_BASE: '',
                SENTRY_DSN: '',
                SENTRY_RELEASE: '',
                SENTRY_ENVIRONMENT: 'test',
            },
            host: 'localhost',
            port: 5050,
        });

        // Stop Miniflare when the process exits
        // eslint-disable-next-line no-undef
        process.on('beforeExit', () => mf.dispose());
    }

    // Reset the cache
    const cache = await mf.getKVNamespace('CACHE');
    await cache.list().then(({ keys }) => Promise.all(keys.map(({ name }) => cache.delete(name))));

    // Create a full request
    const req = new Request(`http://localhost:5050${route}`, opts);

    // Run the pre-hook if defined
    if (typeof preHook === 'function') await preHook(mf, req);

    // Send the request to Miniflare
    return mf.dispatchFetch(req).then(async resp => {
        // Patch in some extras for chai-http

        /**
         * Fetch a header from the response.
         *
         * @param {string} name Name of the header to fetch.
         * @return {string}
         */
        resp.getHeader = name => resp.headers.get(name);

        // Expose the request
        resp.request = req;

        // Replace the text method (returns a promise that consumes the body stream)
        // chai-http expects the text property to be the text content
        const text = await resp.text();
        Reflect.defineProperty(resp, 'text', { value: text });

        // Replace the body property (is a readable stream of the body)
        // chai-http expects the body property to be the parsed body JSON data
        // https://github.com/visionmedia/superagent/blob/9ed29166e2fe01d20a1ae4c06e009b1a27711c27/src/client.js#L275-L287
        if (/[/+]json($|[^-\w])/i.test(resp.headers.get('content-type')?.toLowerCase()))
            Reflect.defineProperty(resp, 'body', { value: JSON.parse(text) });

        // Run the post-hook if defined
        if (typeof postHook === 'function') await postHook(mf, req, resp);

        return resp;
    });
};
