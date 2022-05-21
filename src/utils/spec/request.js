import { fileURLToPath } from 'node:url';
import { Miniflare } from 'miniflare';
import { Request } from '@miniflare/core';

/**
 * @typedef {Response} ExtendedResponse
 * @property {function(string): string|undefined} getHeader Method to access a header (alias to headers.get).
 * @property {Request} request Request that was sent to fetch the response.
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
    return mf.dispatchFetch(req).then(resp => {
        // Patch in some extras for chai-http
        resp.getHeader = name => resp.headers.get(name);
        resp.request = req;
        return resp;
    });
};
