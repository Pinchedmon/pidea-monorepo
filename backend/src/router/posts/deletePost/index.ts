import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { trpc } from "../../../lib/trpc";

export const deletePostTrpcRoute = trpc.procedure

  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.me) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Must be authenticated",
      });
    }

    const post = await ctx.prisma.post.findUnique({
      where: { id: input.id },
    });

    if (!post) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Post not found",
      });
    }

    if (post.authorId !== ctx.me.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the author can delete this post",
      });
    }

    await ctx.prisma.post.delete({
      where: { id: input.id },
    });

    return { success: true };
  });
