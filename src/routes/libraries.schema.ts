import * as z from 'zod';

import { librarySchema } from '../utils/algolia.schema';

export const librariesResponseSchema = z.object({
    results: z.array(
        librarySchema
            .partial()
            .and(
                z.object({
                    name: z.string(),
                    latest: z.string().nullable(),
                }),
            )
            .openapi('LibraryResult', {
                description:
                    'Information about a library on cdnjs when browsing the libraries list',
            }),
    ),
    total: z.number(),
    available: z.number(),
});

export type LibrariesResponse = z.infer<typeof librariesResponseSchema>;
