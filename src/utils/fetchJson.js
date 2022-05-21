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

    // Parse JSON response
    return resp.json().catch(error => {
        const err = new Error(`${options?.method || 'GET'} ${url}: ${error.message}`);
        err.method = options?.method || 'GET';
        err.url = url;
        throw err;
    });
};
