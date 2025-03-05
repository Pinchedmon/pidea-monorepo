/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { AvatarFallback, AvatarImage, Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Heart, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
interface PostProps {
  post: PostType;
  me: string;
  refetch: () => void;
}
export type PostType = {
  author: { nick: string; name: string; avatarUrl?: string | null };
  authorId: string;
  blockedAt: any;
  comments: number;
  id: string;
  postLikes: number;
  text: string;
  isLikedByMe: boolean;
  createdAt: any;
  theme: "IT" | "MEDIA" | "TECH";
};

const LikeButton = ({ Post }: { Post: PostType }) => {
  const trpcUtils = trpc.useUtils();
  const setPostLike = trpc.setPostLike.useMutation({
    onMutate: ({ isLikedByMe }) => {
      const oldGetPostData = trpcUtils.getPost.getData({
        id: Post.id as string,
      });

      if (oldGetPostData?.post) {
        const newGetPostData = {
          ...oldGetPostData,
          post: {
            ...oldGetPostData.post,
            isLikedByMe: !isLikedByMe,
            likesCount: oldGetPostData.post.likesCount + (isLikedByMe ? -1 : 1),
          },
        };

        trpcUtils.getPost.setData({ id: Post.id as string }, newGetPostData);

        const oldGetPostsData = trpcUtils.getPosts.getData();
        if (oldGetPostsData) {
          const updatedPosts = oldGetPostsData.posts.map((post) => {
            if (post.id === Post.id) {
              return {
                ...post,
                isLikedByMe: !isLikedByMe,
                likesCount: post.likesCount + (isLikedByMe ? -1 : 1),
                _count: {
                  ...post._count,
                  postLikes: post._count.postLikes + (isLikedByMe ? -1 : 1),
                },
              };
            }
            return post;
          });

          // Ensure the updated posts match the expected type
          trpcUtils.getPosts.setData(
            {},
            {
              posts: updatedPosts,
              total: oldGetPostsData.total,
            }
          );
        }
      }
    },

    onSuccess: () => {
      // Invalidate the cache for the individual post and the list of posts
      void trpcUtils.getPost.invalidate({ id: Post.id });
      void trpcUtils.getPosts.invalidate();
    },
  });
  return (
    <Button
      onClick={() => {
        void setPostLike.mutateAsync({
          postId: Post.id as string,
          isLikedByMe: !Post.isLikedByMe,
        });
      }}
      className={`${
        Post.isLikedByMe
          ? "bg-white text-red-500 hover:bg-gray-100"
          : "text-white bg-[#37B34A] hover:bg-[#2f9b3f]"
      } flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition-all duration-200 border-2 ${
        Post.isLikedByMe ? "border-red-500" : "border-[#37B34A]"
      }`}
    >
      <Heart
        className={`${Post.isLikedByMe ? "text-red-500" : "text-white"} 
        ${Post.isLikedByMe ? "animate-bounce" : ""}`}
        size={20}
      />
      <span className="font-medium">{Post.postLikes}</span>
    </Button>
  );
};

const Post = (props: PostProps) => {
  const { post, me, refetch } = props;
  const navigate = useNavigate();
  const removePost = trpc.deletePost.useMutation();

  const removeFunc = async () => {
    await removePost.mutateAsync({ id: post.id });
    refetch();
  };

  return (
    <Card className="bg-white dark:bg-[#2c2c2c] hover:bg-gray-50 dark:hover:bg-[#363636] rounded-3xl shadow-lg transition-all duration-200 border border-black/5 dark:border-white/5">
      <CardHeader>
        <div className="w-full flex justify-between items-center">
          <div
            className="flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity group"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            <Avatar className="border-2 border-[#37B34A] group-hover:scale-105 transition-transform">
              <AvatarImage
                src={`http://localhost:3000${post.author.avatarUrl}`}
                alt="User  Avatar"
              />
              <AvatarFallback>
                {post.author.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                @{post.author.nick}
              </CardDescription>
              <CardTitle className="text-black dark:text-white font-semibold group-hover:text-[#37B34A] transition-colors">
                {post.author.name}
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                {new Date(post.createdAt).toLocaleDateString()}{" "}
                {new Date(post.createdAt).toLocaleTimeString()}
              </CardDescription>
            </div>
          </div>
          {me == post.authorId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-[#363636] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500 dark:text-gray-400"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-white dark:bg-[#2c2c2c] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                <Button
                  onClick={() => removeFunc()}
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors rounded-lg px-4 py-2"
                >
                  Удалить
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-black/90 dark:text-white/90 leading-relaxed text-base">
          {post.text}
        </p>
      </CardContent>
      <CardFooter className="gap-4 pt-4">
        <LikeButton Post={post} />
        <Button
          onClick={() => navigate(`/post/${post.id}`)}
          className="bg-[#37B34A] hover:bg-[#2f9b3f] flex items-center gap-2 px-6 py-2 text-white rounded-full shadow-md transition-all duration-200"
        >
          <MessageSquare size={18} />
          <span className="font-medium">{post.comments}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Post;
