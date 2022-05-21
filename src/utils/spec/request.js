import { fileURLToPath } from 'node:url';
import { Miniflare } from 'miniflare';
import { Request } from '@miniflare/core';

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
 * @return {ExtendedResponse}
 */
export default (route, opts = {}) => {
    // Create the Miniflare instance
    const mf = new Miniflare({
        scriptPath: fileURLToPath(new URL('../../../dist-worker/index.js', import.meta.url)),
        wranglerConfigPath: fileURLToPath(new URL('../../../wrangler.toml', import.meta.url)),
        host: 'localhost',
        port: 5050,
    });

    // Create a full request
    const req = new Request(`http://localhost:5050${route}`, opts);

    // Send the request to Miniflare
    return mf.dispatchFetch(req).then(async resp => {
        // Patch in some extras for chai-http
        resp.getHeader = name => resp.headers.get(name);
        resp.request = req;

        const text = await resp.text();
        Reflect.defineProperty(resp, 'text', { value: text });

        // https://github.com/visionmedia/superagent/blob/9ed29166e2fe01d20a1ae4c06e009b1a27711c27/src/client.js#L275-L287
        if (/[/+]json($|[^-\w])/i.test(resp.headers.get('content-type')?.toLowerCase()))
            Reflect.defineProperty(resp, 'body', { value: JSON.parse(text) });

        return resp;
    });
};
