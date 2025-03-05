import { z } from "zod";
import { trpc } from "../../../lib/trpc";

export const getAllUsersRoute = trpc.procedure.query(async ({ ctx }) => {
  return await ctx.prisma.user.findMany({
    select: {
      id: true,
      name: true,
      nick: true,
      role: true,
      email: true,
      createdAt: true,
      avatarUrl: true,
      Image: true,
      posts: true,
      comments: true,
      permissions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
});

export const editUserRoute = trpc.procedure
  .input(
    z.object({
      userId: z.string(),
      name: z.string().optional(),
      nick: z.string().optional(),
      role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId, name, nick, role } = input;
    return await ctx.prisma.user.update({
      where: { id: userId },
      data: {
        name,
        nick,
        role,
      },
    });
  });

export const deleteUserRoute = trpc.procedure
  .input(z.object({ userId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { userId } = input;
    return await ctx.prisma.user.delete({
      where: { id: userId },
    });
  });
