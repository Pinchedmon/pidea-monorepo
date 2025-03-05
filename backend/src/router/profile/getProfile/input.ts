import { z } from "zod";

export const zGetProfileTrpcInput = z.object({
  id: z.string().min(1),
});
