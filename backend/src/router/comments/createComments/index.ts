import { trpc } from "../../../lib/trpc";
import { zCommentInput } from "../../../utils/types";

export const createCommentTrpcRoute = trpc.procedure
  .input(zCommentInput.omit({ id: true }))
  .mutation(async ({ ctx, input }) => {
    if (!ctx.me?.id) {
      throw new Error("Unauthorized");
    }
    const comment = await ctx.prisma.comment.create({
      data: {
        content: input.content,
        postId: input.postId,
        authorId: ctx.me.id,
      },
    });
    return comment;
  });
