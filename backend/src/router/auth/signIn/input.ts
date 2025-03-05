import { z } from "zod";

export const zSignInTrpcInput = z.object({
  name: z.string(),
  password: z.string(),
});
