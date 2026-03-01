import { algoliasearch } from 'algoliasearch';
import { env, waitUntil } from 'cloudflare:workers';
import * as Sentry from '@sentry/cloudflare';
import * as z from 'zod';

import { librarySchema, type Library } from './algolia.schema.ts';

/**
 * Convert an ArrayBuffer to a hex string.
 *
 * @param buf Buffer to convert.
 */
const bufToHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

/**
 * Limit a string to a specific byte length, ensuring we don't cut off in the middle of a multi-byte character.
 *
 * @param str String to limit.
 * @param byteLimit Maximum byte length.
 */
const limitToByteLength = (str: string, byteLimit: number) => {
    const encoder = new TextEncoder();
    let bytes = 0;
    let i = 0;
    while (i < str.length && bytes < byteLimit) {
        const charBytes = encoder.encode(str[i]).length;
        if (bytes + charBytes > byteLimit) break;
        bytes += charBytes;
        i++;
    }
    return str.slice(0, i);
};

/**
 * Create an Algolia SearchClient for the cdnjs app.
 *
 * @see https://github.com/algolia/algoliasearch-client-javascript/blob/main/packages/client-search/builds/fetch.ts
 */
const client = () => algoliasearch('2QWLVLXZB6', 'e16bd99a5c7a8fccae13ad40762eec3c');

/**
 * Browse an Algolia index to get all objects matching a query.
 *
 * @param query Query to fetch matching objects for.
 * @param searchFields Fields to consider for query.
 */
export const libraries = async (searchQuery: string, searchFields: string[]) => {
    // Normalize the search fields to only permit fields searchable in Aloglia, and sort them to ensure consistent cache keys
    const searchable = [ 'name', 'alternativeNames', 'github.repo', 'description', 'keywords', 'filename', 'repositories.url', 'github.user', 'maintainers.name' ];
    const fields = searchFields.filter(field => searchable.includes(field)).sort();

    // Limit the search query to a maximum of 512 bytes to match Algolia's limit
    const query = limitToByteLength(searchQuery, 512);

    // Check if there is a cached result for this query
    const cacheKey = await crypto.subtle.digest(
        { name: 'SHA-512' },
        new TextEncoder().encode(`${query}:${fields.join(',')}`),
    ).then(buf => `libraries:${bufToHex(buf)}`);
    const cached = await env.CACHE.get(cacheKey, { type: 'json' });
    if (cached) {
        const parsed = z.array(librarySchema).safeParse(cached);
        if (parsed.success) {
            return parsed.data;
        }
    }

    // Fetch the results from Algolia
    const hits: Library[] = [];
    await client().browseObjects({
        indexName: 'libraries',
        browseParams: {
            query,
            restrictSearchableAttributes: fields,
        },
        /**
         * Store an incoming response with hits.
         *
         * @param res Incoming response.
         */
        aggregator: res => {
            res.hits.forEach(hit => {
                const parsed = librarySchema.safeParse(hit);
                if (parsed.success) {
                    hits.push(parsed.data);
                } else {
                    console.warn('Found bad entry in Algolia data', parsed.error.issues, hit);
                    Sentry.withScope(scope => {
                        scope.setExtra('issues', parsed.error.issues);
                        scope.setExtra('hit', hit);
                        Sentry.captureException(new Error('Bad entry in Algolia data'));
                    });
                }
            });
        },
    }).catch(err => {
        throw err instanceof Error ? err : new Error(`${err.name}: ${err.message}`);
    });

    // Cache the results for 15 minutes
    waitUntil(env.CACHE.put(cacheKey, JSON.stringify(hits), { expirationTtl: 60 * 15 }));
    return hits;
};
