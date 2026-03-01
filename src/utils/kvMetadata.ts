import { env } from 'cloudflare:workers';

import fetchJson from './fetchJson.ts';
import sortVersions from './sort.ts';
import {
    librariesSchema,
    librarySchema,
    libraryVersionSchema,
    libraryVersionSriSchema,
    libraryVersionsSchema,
} from './kvMetadata.schema.ts';

const kvBase = env.METADATA_BASE || 'https://metadata.speedcdnjs.com';

/**
 * Get a list of libraries.
 */
export const libraries = () =>
    fetchJson(`${kvBase}/packages`)
        .then(librariesSchema.parse);

/**
 * Get the metadata for a library.
 *
 * @param name Name of the library to fetch.
 */
export const library = (name: string) =>
    fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}`)
        .then(res => {
            console.log(res);
            return res;
        })
        .then(librarySchema.parse)
        .then(res => {
            console.log(res);
            return res;
        });

/**
 * Get the versions for a library.
 *
 * @param name Name of the library to fetch.
 */
export const libraryVersions = (name: string) =>
    fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}/versions`)
        .then(libraryVersionsSchema.parse)
        .then(sortVersions);

/**
 * Get the assets for a library version.
 *
 * @param name Name of the library to fetch.
 * @param version Version of the library to fetch.
 */
export const libraryVersion = (name: string, version: string) =>
    fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}/versions/${encodeURIComponent(version)}`)
        .then(libraryVersionSchema.parse);

/**
 * Get the SRI data for a library's version.
 *
 * @param name Name of the library to fetch.
 * @param version Version of the library to fetch.
 */
export const libraryVersionSri = (name: string, version: string) =>
    fetchJson(`${kvBase}/packages/${encodeURIComponent(name)}/sris/${encodeURIComponent(version)}`)
        .then(libraryVersionSriSchema.parse);
