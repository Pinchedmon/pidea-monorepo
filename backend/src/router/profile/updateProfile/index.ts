import { trpc } from "../../../lib/trpc";
import { z } from "zod";

export const updateProfileTrpcRoute = trpc.procedure
  .input(
    z.object({
      name: z.string().optional(),
      nick: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new Error("Unauthorized");
    }

    const updatedUser = await ctx.prisma.user.update({
      where: { id: ctx.me.id },
      data: {
        name: input.name,
        nick: input.nick,
      },
      select: {
        id: true,
        nick: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return updatedUser;
  });
