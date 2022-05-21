import { inflate } from 'pako';
import isGzip from 'is-gzip';
import isDeflate from 'is-deflate';

/**
 * Cleanly make a fetch request, throwing an error for any non-ok response.
 * Optionally, provide a timeout in milliseconds.
 *
 * @param {RequestInfo} url URL to fetch in the request.
 * @param {RequestInit} [options={}] Options for the request being made.
 * @param {number} [timeout=30] Optional timeout in seconds.
 * @return {Promise<*>}
 */
export default async (url, options = {}, timeout = 30) => {
    // Create the timeout
    const hasTimeout = typeof timeout === 'number' && timeout > 0;
    const controller = hasTimeout && new AbortController();
    const timer = hasTimeout && setTimeout(() => controller.abort(), timeout * 1000);

    // Run the request
    let resp;
    try {
        resp = await fetch(url, {
            ...options,
            ...(hasTimeout
                ? { signal: controller.signal }
                : {}),
        });
    } catch (error) {
        // If the request was aborted, throw a nice error
        if (error.name === 'AbortError') {
            const err = new Error(`${options?.method || 'GET'} ${url}: Timed out after ${timeout}s`);
            err.original = error;
            err.method = options?.method || 'GET';
            err.url = url;
            throw err;
        }

        // Otherwise, throw the original error
        throw error;
    } finally {
        // Clear the timeout
        if (hasTimeout) clearTimeout(timer);
    }

    // Handle failures
    if (!resp.ok) {
        const err = new Error(`${options?.method || 'GET'} ${url}: ${resp.status} ${resp.statusText}`);
        err.method = options?.method || 'GET';
        err.url = url;
        err.status = resp.status;
        err.statusText = resp.statusText;
        throw err;
    }

    // Get the raw data, inflate it (packages/:package/all returns double-gzip'ed data), and parse the JSON
    return resp.arrayBuffer()
        .then(raw => new Uint8Array(raw))
        .then(raw => (isGzip(raw) || isDeflate(raw))
            ? inflate(raw, { to: 'string' })
            : new TextDecoder('utf-8').decode(raw))
        .then(text => JSON.parse(text))
        .catch(error => {
            const err = new Error(`${options?.method || 'GET'} ${url}: ${error.message}`);
            err.original = error;
            err.method = options?.method || 'GET';
            err.url = url;
            throw err;
        });
};
