import * as z from 'zod';

export const whitelistResponseSchema = z.object({
    extensions: z.array(z.string()),
    categories: z.record(z.string(), z.string()),
}).partial();

export type WhitelistResponse = z.infer<typeof whitelistResponseSchema>;
