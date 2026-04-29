import * as z from 'zod';

export const openApiResponseSchema = z.object({
    openapi: z.string(),
    info: z.object({
        title: z.string(),
        description: z.string().optional(),
        version: z.string(),
    }),
    servers: z
        .array(
            z.object({
                url: z.string(),
                description: z.string().optional(),
            }),
        )
        .optional(),
    paths: z.record(z.string(), z.unknown()).openapi({ type: 'object' }),
    components: z
        .object({
            schemas: z
                .record(z.string(), z.unknown())
                .openapi({ type: 'object' })
                .optional(),
        })
        .optional(),
});

export type OpenApiResponse = z.infer<typeof openApiResponseSchema>;
