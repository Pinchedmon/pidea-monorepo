import { z } from "zod";
import { trpc } from "../../../lib/trpc";

export const deleteCommentTrpcRoute = trpc.procedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const deletedComment = await ctx.prisma.comment.deleteMany({
      where: {
        id: input.id,
        authorId: ctx.me?.id as string,
      },
    });

    if (deletedComment.count === 0) {
      throw new Error("Comment not found or not authorized");
    }

    return deletedComment;
  });
