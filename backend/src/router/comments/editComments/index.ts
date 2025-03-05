import { trpc } from "../../../lib/trpc";
import { zCommentInput } from "../../../utils/types";

export const updateCommentTrpcRoute = trpc.procedure
  .input(zCommentInput) // С ID для редактирования
  .mutation(async ({ ctx, input }) => {
    const updatedComment = await ctx.prisma.comment.updateMany({
      where: {
        id: input.id,
        authorId: ctx.me?.id as string,
      },
      data: {
        content: input.content,
      },
    });

    if (updatedComment.count === 0) {
      throw new Error("Comment not found or not authorized");
    }

    return updatedComment;
  });
