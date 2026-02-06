import { env } from 'cloudflare:workers';

import fetchJson from './fetchJson.js';

const kvBase = env.METADATA_BASE || 'https://metadata.speedcdnjs.com';

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
 * @param {import('toucan-js')} [sentry] Sentry instance for missing version reporting.
 * @return {T & { assets: [] }}
 */
const kvLibraryValidate = (library, data, sentry = undefined) => {
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
        sentry?.withScope(scope => {
            scope.setExtra('data', data);
            sentry.captureException(new Error('Version missing in package data'));
        });
        throw new Error('Version missing in package data');
    }

    return data;
};

/**
 * Get the metadata for a library.
 *
 * @param {string} name Name of the library to fetch.
 * @param {import('toucan-js')} [sentry] Sentry instance for data validation reporting.
 * @return {Promise<Object>}
 */
export const library = (name, sentry = undefined) => fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}`)
    .then(data => kvLibraryValidate(name, data, sentry));

/**
 * Get the versions for a library.
 *
 * @param {string} name Name of the library to fetch.
 * @return {Promise<string[]>}
 */
export const libraryVersions = name => fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}/versions`);

/**
 * Get the assets for a library version.
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
