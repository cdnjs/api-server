import * as z from 'zod';

export const librariesSchema = z.array(z.string());

export type Libraries = z.infer<typeof librariesSchema>;

export const librarySchema = z.object({
    name: z.string(),
    filename: z.string(),
    version: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    homepage: z.string().optional(),
    license: z.string().optional(),
    author: z.string(),
    repository: z.object({
        type: z.string(),
        url: z.string(),
    }).nullable(),
    autoupdate: z.union([
        z.object({
            type: z.string(),
            target: z.string(),
        }),
        z.object({
            source: z.string(),
            target: z.string(),
        }),
    ]).optional(),
});

export type Library = z.infer<typeof librarySchema>;

export const libraryVersionsSchema = z.array(z.string());

export type LibraryVersions = z.infer<typeof libraryVersionsSchema>;

export const libraryVersionSchema = z.array(z.string());

export type LibraryVersion = z.infer<typeof libraryVersionSchema>;

export const libraryVersionSriSchema = z.record(z.string(), z.string());

export type LibraryVersionSri = z.infer<typeof libraryVersionSriSchema>;
