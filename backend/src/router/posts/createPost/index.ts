import { trpc } from "../../../lib/trpc";
import { zPostInput } from "../../../utils/types";

export const createPostTrpcRoute = trpc.procedure
  .input(zPostInput.omit({ id: true }))
  .mutation(async ({ ctx, input }) => {
    console.log(ctx, input);
    if (!ctx.me?.id) {
      throw new Error("Unauthorized");
    }

    const post = await ctx.prisma.post.create({
      data: {
        text: input.text,
        theme: input.theme,
        authorId: ctx.me.id, // Безопасно используем ctx.me.id
        status: "PENDING",
      },
    });
    return post;
  });
