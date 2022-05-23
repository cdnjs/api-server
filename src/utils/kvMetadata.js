/* global METADATA_BASE */

import fetchJson from './fetchJson.js';

const kvBase = (typeof METADATA_BASE === 'string' ? METADATA_BASE : '') || 'https://metadata.speedcdnjs.com';

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
        // TODO: Sentry
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

/**
 * Get the metadata for a library's version on KV.
 *
 * @param {string} name Name of the library to fetch.
 * @param {string} version Version of the library to fetch.
 * @return {Promise<string[]>}
 */
export const libraryVersion = (name, version) => fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}/versions/${encodeURIComponent(version)}`);

/**
 * Get the SRI data for a library's version.
 *
 * @param {string} name Name of the library to fetch.
 * @param {string} version Version of the library to fetch.
 * @return {Promise<Object<string, string>>}
 */
export const libraryVersionSri = (name, version) => fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}/sris/${encodeURIComponent(version)}`);

/**
 * Get the full metadata for a library incl. versions on KV.
 *
 * @param {string} name Name of the library to fetch.
 * @return {Promise<Object>}
 */
export const libraryFull = name => fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}/all`)
    .then(data => kvLibraryValidate(name, data));

/**
 * Get all the SRI data for an entire library.
 *
 * @param {string} name Name of the library to fetch.
 * @return {Promise<Object<string, string>>}
 */
export const librarySri = name => fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}/sris`);
