import { trpc } from "../../../lib/trpc";
import { zPostInput } from "../../../utils/types";

export const updatePostTrpcRoute = trpc.procedure
  .input(zPostInput) // С ID для редактирования
  .mutation(async ({ ctx, input }) => {
    const updatedPost = await ctx.prisma.post.updateMany({
      where: {
        id: input.id,
        authorId: ctx.me?.id, // Только автор может редактировать
      },
      data: {
        text: input.text,
        theme: input.theme,
      },
    });

    if (updatedPost.count === 0) {
      throw new Error("Post not found or not authorized");
    }

    return updatedPost;
  });
