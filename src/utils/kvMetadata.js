/* global METADATA_BASE */

import fetchJson from './fetchJson.js';

const kvBase = METADATA_BASE || 'https://metadata.speedcdnjs.com';

/**
 * Get a list of libraries.
 *
 * @return {Promise<string[]>}
 */
export const libraries = () => fetchJson(`${kvBase}/packages`);
