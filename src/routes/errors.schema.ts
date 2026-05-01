import * as z from 'zod';

export const errorResponseSchema = z
    .object({
        error: z.literal(true),
        status: z.number(),
        message: z.string(),
        ref: z.string().optional(),
    })
    .openapi('Error');

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
