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
    .openapi('LibraryVersion');

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
    .openapi('Library');

export type LibraryResponse = z.infer<typeof libraryResponseSchema>;
