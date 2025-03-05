import { z } from "zod";
import { trpc } from "../../../lib/trpc";

export const updateProfileTrpcRoute = trpc.procedure
  .input(
    z.object({
      nick: z.string(),
      name: z.string(),
      avatarUrl: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.prisma.user.update({
      where: { id: ctx.me.id },
      data: {
        nick: input.nick,
        name: input.name,
        avatarUrl: input.avatarUrl,
      },
    });

    return user;
  });
