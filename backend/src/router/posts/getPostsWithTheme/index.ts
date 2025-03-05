import { z } from "zod";
import { trpc } from "../../../lib/trpc";
import { zPostInput } from "../../../utils/types";

export const getPostsWithThemeTrpcRoute = trpc.procedure
  .input(zPostInput.omit({ id: true, text: true }))
  .query(async ({ ctx, input }) => {
    const posts = await ctx.prisma.post.findMany({
      where: { theme: input.theme, status: "APPROVED" },
      include: {
        author: { select: { nick: true, name: true, avatarUrl: true } },
        _count: {
          select: { comments: true, postLikes: true },
        },

        postLikes: {
          select: {
            id: true,
          },
          where: {
            userId: ctx.me?.id, // Check if the current user liked the post
          },
        },
      },
    });

    // Переименовываем _count.comments в comments
    const formattedPosts = posts.map((post) => {
      const isLikedByMe = !!post?.postLikes.length; // Check if the post is liked by the current user
      return {
        ...post,
        comments: post._count.comments,
        postLikes: post._count.postLikes,
        isLikedByMe, // Add the like status
        likesCount: post._count.postLikes, // Count of likes
      };
    });

    return formattedPosts;
  });

export const getPostsForProfileTrpcRoute = trpc.procedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const posts = await ctx.prisma.post.findMany({
      where: { authorId: input.id },
      include: {
        author: { select: { nick: true, name: true, avatarUrl: true } },
        _count: {
          select: { comments: true, postLikes: true },
        },
        postLikes: {
          select: {
            id: true,
          },
          where: {
            userId: ctx.me?.id, // Check if the current user liked the post
          },
        },
      },
    });

    // Переименовываем _count.comments в comments
    const formattedPosts = posts.map((post) => {
      const isLikedByMe = !!post.postLikes.length; // Check if the post is liked by the current user
      return {
        ...post,
        comments: post._count.comments,
        postLikes: post._count.postLikes,
        isLikedByMe, // Add the like status
        likesCount: post._count.postLikes, // Count of likes
      };
    });

    return formattedPosts;
  });
