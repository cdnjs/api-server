import isDeflate from 'is-deflate';
import isGzip from 'is-gzip';
import { inflate } from 'pako';

class FetchError extends Error {
    method: string
    url: RequestInfo;
    status?: number;
    statusText?: string;

    constructor(message: string, options: { method: string; url: RequestInfo; status?: number; statusText?: string; cause?: unknown }) {
        super(`${options.method} ${options.url}: ${message}`, { cause: options.cause });
        this.method = options.method;
        this.url = options.url;
        this.status = options.status;
        this.statusText = options.statusText;
    }
}

/**
 * Cleanly make a fetch request, throwing an error for any non-ok response.
 * Optionally, provide a timeout in milliseconds.
 *
 * @param url URL to fetch in the request.
 * @param options Options for the request being made.
 * @param timeout Optional timeout in seconds.
 */
export default async (url: RequestInfo, options: RequestInit = {}, timeout: number = 30) => {
    // Create the timeout
    const hasTimeout = typeof timeout === 'number' && timeout > 0;
    const controller = hasTimeout && new AbortController();
    const timer = hasTimeout && setTimeout(() => controller.abort(), timeout * 1000);

    // Run the request
    let resp: Response;
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
            throw new FetchError(`Timed out after ${timeout}s`, {
                method: options?.method || 'GET',
                url,
                cause: error,
            });
        }

        // Otherwise, throw the original error
        throw error;
    } finally {
        // Clear the timeout
        if (hasTimeout) clearTimeout(timer);
    }

    // Handle failures
    if (!resp.ok) {
        throw new FetchError(`${resp.status} ${resp.statusText}`, {
            method: options?.method || 'GET',
            url,
            status: resp.status,
            statusText: resp.statusText,
        });
    }

    // Get the raw data, inflate it (packages/:package/all returns double-gzip'ed data), and parse the JSON
    return resp.arrayBuffer()
        .then(raw => new Uint8Array(raw))
        .then(raw => (isGzip(raw) || isDeflate(raw))
            ? inflate(raw, { to: 'string' })
            : new TextDecoder('utf-8').decode(raw))
        .then(text => JSON.parse(text))
        .catch(error => {
            throw new FetchError(error.message, {
                method: options?.method || 'GET',
                url,
                status: resp.status,
                statusText: resp.statusText,
                cause: error,
            });
        });
};
