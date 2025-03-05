/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import css from "./index.module.scss";
import { format } from "date-fns";
import { getEditPostRoute, getViewPostRoute } from "../../../lib/routes";
import { trpc } from "../../../lib/trpc";

import { Heart, MessageSquare } from "lucide-react";
import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NewCommentArea } from "@/components/NewCommentArea";
import { useParams } from "react-router";
import { useMe } from "@/lib/ctx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentProps {
  comment: CommentType;
  me: string;
  refetch: () => void;
}
export type CommentType = {
  author: { nick: string; name: string };
  authorId: string;
  id: string;
  content: string;
  createdAt: any;
  postId: string;
};

const Comment = (props: CommentProps) => {
  const { author, authorId, content, id } = props.comment;

  console.log(props);
  const removeComment = trpc.deleteComment.useMutation();

  const removeFunc = async () => {
    await removeComment.mutateAsync({ id: id });
    props.refetch();
  };

  return (
    <Card className="bg-white dark:bg-[#2c2c2c] hover:bg-gray-50 dark:hover:bg-[#363636] rounded-3xl shadow-lg transition-all duration-200 border border-black/5 dark:border-white/5">
      <CardHeader>
        <div className="w-full flex justify-between">
          <div className="flex items-center gap-4 group">
            <Avatar className="border-2 border-[#37B34A] group-hover:scale-105 transition-transform">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                @{author.nick}
              </CardDescription>
              <CardTitle className="text-black dark:text-white font-semibold group-hover:text-[#37B34A] transition-colors">
                {author.name}
              </CardTitle>
            </div>
          </div>
          {props.me == authorId && (
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
          {content}
        </p>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};

export const ViewPostPage = () => {
  const { PostNick } = getViewPostRoute.useParams();
  const { data, isLoading, error, refetch } = trpc.getPost.useQuery({
    id: PostNick,
  });
  const me = useMe();
  if (!data) {
    return <div>No post</div>;
  }
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <Post
          post={{ ...data.post, comments: data.comments.length }}
          me={me?.id as string}
          refetch={refetch}
        />

        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-white bg-[#37B34A] px-6 py-3 rounded-full shadow-md">
            Комментарии ({data.comments.length})
          </h2>
        </div>

        <div className="space-y-4">
          {data.comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment as any}
              refetch={refetch}
              me={me?.id as string}
            />
          ))}
        </div>

        <div className="pt-4">
          <NewCommentArea />
        </div>
      </div>
    </div>
  );
  // <Segment title={Post.name} description={Post.description}>
  //   <div className={css.createdAt}>
  //     Created At: {format(Post.createdAt as Date, "yyyy-MM-dd")}
  //   </div>
  //   <div className={css.author}>
  //     Author: {Post.author.nick}
  //     {Post.author.name ? ` (${Post.author.name})` : ""}
  //   </div>
  //   <div className={css.text} dangerouslySetInnerHTML={{ __html: Post.text }} />
  //   <div className={css.likes}>
  //     Likes: {Post.likesCount}
  //     {me && (
  //       <>
  //         <br />
  //         <LikeButton Post={Post} />
  //       </>
  //     )}
  //   </div>
  //   {canEditPost(me, Post) && (
  //     <div className={css.editButton}>
  //       <LinkButton to={getEditPostRoute({ PostNick: Post.nick })}>
  //         Edit Post
  //       </LinkButton>
  //     </div>
  //   )}
  //   {canBlockPosts(me) && (
  //     <div className={css.blockPost}>
  //       <BlockPost Post={Post} />
  //     </div>
  //   )}
  // </Segment>
};
