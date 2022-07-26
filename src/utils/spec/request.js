import { fileURLToPath } from 'node:url';

import { Miniflare, Request } from 'miniflare';

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
    const mf = new Miniflare({
        scriptPath: fileURLToPath(new URL('../../../dist-worker/index.js', import.meta.url)),
        wranglerConfigPath: fileURLToPath(new URL('../../../wrangler.toml', import.meta.url)),
        host: 'localhost',
        port: 5050,
    });

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
