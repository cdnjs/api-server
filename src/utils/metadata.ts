import { env } from 'cloudflare:workers';

import fetch from './fetch.ts';
import {
    librariesSchema,
    librarySchema,
    libraryVersionSchema,
    libraryVersionSriSchema,
    libraryVersionsSchema,
} from './metadata.schema.ts';
import sortVersions from './sort.ts';

const base = env.METADATA_BASE || 'https://metadata.speedcdnjs.com';

/**
 * Get a list of libraries.
 */
export const libraries = () =>
    fetch(`${base}/packages`).then(librariesSchema.parse);

/**
 * Get the metadata for a library.
 *
 * @param name Name of the library to fetch.
 */
export const library = (name: string) =>
    fetch(`${base}/packages/${encodeURIComponent(name)}`).then(
        librarySchema.parse,
    );

/**
 * Get the versions for a library.
 *
 * @param name Name of the library to fetch.
 */
export const libraryVersions = (name: string) =>
    fetch(`${base}/packages/${encodeURIComponent(name)}/versions`)
        .then(libraryVersionsSchema.parse)
        .then(sortVersions);

/**
 * Get the assets for a library version.
 *
 * @param name Name of the library to fetch.
 * @param version Version of the library to fetch.
 */
export const libraryVersion = (name: string, version: string) =>
    fetch(
        `${base}/packages/${encodeURIComponent(name)}/versions/${encodeURIComponent(version)}`,
    ).then(libraryVersionSchema.parse);

/**
 * Get the SRI data for a library's version.
 *
 * @param name Name of the library to fetch.
 * @param version Version of the library to fetch.
 */
export const libraryVersionSri = (name: string, version: string) =>
    fetch(
        `${base}/packages/${encodeURIComponent(name)}/sris/${encodeURIComponent(version)}`,
    ).then(libraryVersionSriSchema.parse);
