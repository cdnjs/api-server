import * as z from 'zod';

import { librarySchema } from '../utils/metadata.schema';

export const libraryVersionResponseSchema = z
    .object({
        name: z.string(),
        version: z.string(),
        files: z.array(z.string()),
        rawFiles: z.array(z.string()),
        sri: z.record(z.string(), z.string()),
    })
    .partial()
    .openapi('LibraryVersion', {
        description:
            'Information about a specific version of a library on cdnjs',
    });

export type LibraryVersionResponse = z.infer<
    typeof libraryVersionResponseSchema
>;

export const libraryResponseSchema = librarySchema
    .extend({
        latest: z.string().nullable(),
        sri: z.string().nullable(),
        versions: z.array(z.string()),
        assets: z.array(
            z.object({
                version: z.string(),
                files: z.array(z.string()),
                rawFiles: z.array(z.string()),
                sri: z.record(z.string(), z.string()),
            }),
        ),
    })
    .partial()
    .openapi('Library', {
        description: 'Information about a library on cdnjs',
    });

export type LibraryResponse = z.infer<typeof libraryResponseSchema>;
