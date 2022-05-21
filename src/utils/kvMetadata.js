/* global METADATA_BASE */

import fetchJson from './fetchJson.js';

const kvBase = METADATA_BASE || 'https://metadata.speedcdnjs.com';

/**
 * Get a list of libraries.
 *
 * @return {Promise<string[]>}
 */
export const libraries = () => fetchJson(`${kvBase}/packages`);

/**
 * @template {Object} T
 *
 * Validate the data we get from KV for a library.
 *
 * @param {string} library Requested library name.
 * @param {T} data Returned library data to validate.
 * @return {T & { assets: [] }}
 */
const kvLibraryValidate = (library, data) => {
    // Assets might not exist if there are none, but we should make it an empty array by default
    data.assets = data.assets || [];

    // Non-breaking issues
    if (library !== data.name) {
        console.info('Name mismatch', library, data.name);
        data.name = library;
    }

    // Breaking issues
    if (!data.version) {
        console.error('Version missing', data.name, data);
        // if (process.env.SENTRY_DSN) {
        //     Sentry.withScope(scope => {
        //         scope.setTag('data', JSON.stringify(data));
        //         Sentry.captureException(new Error('Version missing in package data'));
        //     });
        // }
        throw new Error('Version missing in package data');
    }

    return data;
};

/**
 * Get the metadata for a library on KV.
 *
 * @param {string} name Name of the library to fetch.
 * @return {Promise<Object>}
 */
export const library = name => fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}`)
    .then(data => kvLibraryValidate(name, data));
