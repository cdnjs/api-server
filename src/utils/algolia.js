import algoliasearch from 'algoliasearch';

/**
 * Custom requester for Algolia using fetch.
 *
 * @type {import('@algolia/requester-common').Requester}
 */
const requester = {
    /**
     * Send a request to the Algolia API.
     *
     * @param {import('@algolia/requester-common').Request} req Request to send.
     * @return {Promise<import('@algolia/requester-common').Response>}
     */
    send: req => {
        // Create the timeout
        const hasTimeout = typeof req.responseTimeout === 'number' && req.responseTimeout > 0;
        const controller = hasTimeout && new AbortController();
        const timer = hasTimeout && setTimeout(() => controller.abort(), req.responseTimeout * 1000);

        // Send the request
        return fetch(req.url, {
            method: req.method,
            headers: req.headers,
            body: req.data,
            ...(hasTimeout
                ? { signal: controller.signal }
                : {}),
        }).then(async resp => ({
            content: await resp.text().catch(() => ''),
            isTimedOut: false,
            status: resp.status,
        })).catch(err => ({
            content: '',
            isTimedOut: err.name === 'AbortError',
            status: -1,
        })).finally(() => {
            if (timer) clearTimeout(timer);
        });
    },
};

/**
 * Create an Algolia SearchClient for the cdnjs app using a custom fetch requester.
 *
 * @return {import('algoliasearch').SearchClient}
 */
export default () => algoliasearch('2QWLVLXZB6', 'e16bd99a5c7a8fccae13ad40762eec3c', { requester });
