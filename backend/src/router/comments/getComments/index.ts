import { z } from "zod";
import { trpc } from "../../../lib/trpc";

// **8. Получение комментариев**
export const getCommentsTrpcRoute = trpc.procedure
  .input(z.object({ postId: z.string() }))
  .query(async ({ ctx, input }) => {
    const comments = await ctx.prisma.comment.findMany({
      where: { postId: input.postId },
      include: {
        author: { select: { nick: true } },
        post: { select: { text: true } },
      },
    });

    return comments;
  });
