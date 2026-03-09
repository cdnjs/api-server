import * as z from 'zod';

import { librarySchema } from '../utils/algolia.schema';

export const librariesResponseSchema = z.object({
    results: z.array(
        librarySchema.partial().and(
            z.object({
                name: z.string(),
                latest: z.string().nullable(),
            }),
        ),
    ),
    total: z.number(),
    available: z.number(),
});

export type LibrariesResponse = z.infer<typeof librariesResponseSchema>;
