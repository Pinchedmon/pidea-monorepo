import { z } from "zod";
import { trpc } from "../../../lib/trpc";

export const getProfileTrpcRoute = trpc.procedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        nick: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  });
