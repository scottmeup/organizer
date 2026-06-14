import { z } from 'zod';
const metadataSchema = z.object({ kind: z.string().optional(), title_mode: z.string().optional(), schedule: z.record(z.any()).optional(), reminders: z.record(z.any()).optional(), links: z.record(z.any()).optional(), reports: z.record(z.any()).optional(), display: z.record(z.any()).optional() });
export function validateMetadata(input) {
  const result = metadataSchema.safeParse(input || {});
  return { ok: result.success, errors: result.success ? [] : result.error.issues, normalized: result.success ? result.data : null };
}
