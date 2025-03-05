import { trpc } from "../../../lib/trpc";
import { zPostInput } from "../../../utils/types";

export const getPostTrpcRoute = trpc.procedure
  .input(zPostInput.omit({ text: true, theme: true }))
  .query(async ({ ctx, input }) => {
    const post = await ctx.prisma.post.findUnique({
      where: {
        id: input.id,
      },
      include: {
        _count: {
          select: { postLikes: true },
        },
        author: { select: { nick: true, name: true } },
        postLikes: {
          select: {
            id: true,
          },
          where: {
            userId: ctx.me?.id,
          },
        },
        comments: {
          select: {
            id: true,
            authorId: true,
            content: true,
            createdAt: true,
            author: { select: { nick: true, name: true } },
          },
        },
      },
    });

    if (!post) {
      throw new Error("NOT_FOUND");
    }
    const isLikedByMe = !!post?.postLikes.length;
    const likesCount = post?._count.postLikes || 0;
    const formattedPosts = {
      ...post,
      postLikes: post._count.postLikes,
      isLikedByMe,
      likesCount,
    };
    const { comments, ...onlyPost } = formattedPosts;

    const onlyComments = comments;
    return { post: onlyPost, comments: onlyComments };
  });
