import { fileURLToPath } from 'node:url';
import { Miniflare } from 'miniflare';
import { Request } from '@miniflare/core';

/**
 * Dispatch a fetch request to Miniflare.
 *
 * @param {string} route
 * @param {RequestInit} [opts={}]
 * @return {Response}
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
