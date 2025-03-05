import { trpc } from "../../../lib/trpc";
import { z } from "zod";
import { PostStatus, Prisma } from "@prisma/client";

export const getPostsTrpcRoute = trpc.procedure
  .input(
    z.object({
      searchQuery: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      page: z.number().min(1).optional(),
      limit: z.number().min(1).optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { searchQuery, sortOrder = "desc", page = 1, limit = 10 } = input;

    const where = {
      ...(searchQuery && {
        text: {
          contains: searchQuery,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      status: PostStatus.APPROVED,
    };

    const [posts, total] = await Promise.all([
      ctx.prisma.post.findMany({
        where,
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
              userId: ctx.me?.id,
            },
          },
        },

        orderBy: {
          createdAt: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      ctx.prisma.post.count({ where }),
    ]);

    const formattedPosts = posts.map((post) => {
      const isLikedByMe = !!post.postLikes.length;
      return {
        ...post,
        comments: post._count.comments,
        postLikes: post._count.postLikes,
        isLikedByMe,
        likesCount: post._count.postLikes,
      };
    });

    return {
      posts: formattedPosts,
      total,
    };
  });
