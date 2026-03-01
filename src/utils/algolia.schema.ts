import * as z from 'zod';

export const librarySchema =
    z.object({
        // Name fields
        name: z.string(),
        alternativeNames: z.array(z.string()),
        originalName: z.string(),

        // Package metadata fields
        version: z.string(),
        description: z.string(),
        keywords: z.array(z.string()),
        license: z.string(),
        homepage: z.string(),
        author: z.string(),

        // Default file fields
        filename: z.string(),
        sri: z.string(),
        fileType: z.string(),

        // Additional metadata fields
        github: z.object({
            repo: z.string(),
            user: z.string(),
            stargazers_count: z.number(),
            forks: z.number(),
            subscribers_count: z.number(),
        }).nullable(),
        repository: z.object({
            type: z.string(),
            url: z.string(),
        }).nullable(),

        // Algolia object ID
        objectID: z.string(),
    });

export type Library = z.infer<typeof librarySchema>;
