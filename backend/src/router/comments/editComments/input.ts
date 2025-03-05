import { z } from 'zod'

export const zGetPostsTrpcInput = z.object({
  search: z.string().optional(),
  cursor: z.coerce.number().optional(),
  limit: z.number().min(1).max(100).default(10),
})
