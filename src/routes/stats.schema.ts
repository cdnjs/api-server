import * as z from 'zod';

export const statsResponseSchema = z.object({
    libraries: z.number(),
}).partial();

export type StatsResponse = z.infer<typeof statsResponseSchema>;
