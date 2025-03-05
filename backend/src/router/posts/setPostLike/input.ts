import { z } from "zod";

export const zSetPostLikeIdeaTrpcInput = z.object({
  postId: z.string().min(1),
  isLikedByMe: z.boolean(),
});
