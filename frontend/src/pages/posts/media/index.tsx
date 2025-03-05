/* eslint-disable @typescript-eslint/no-unused-vars */
import Post, { PostType } from "@/components/Post";
import { NewPostArea } from "../../../components/NewPostArea";
import { trpc } from "@/lib/trpc";
import { useMe } from "@/lib/ctx";

export const MediaPage = () => {
  const { data, error, isLoading, isError, refetch } =
    trpc.getPostsWithTheme.useQuery({ theme: "MEDIA" });

  console.log(data);
  const me = useMe();
  return (
    <section className="w-full flex flex-col ">
      {me && <NewPostArea theme={"MEDIA"} />}
      <div className="flex  flex-col gap-4 mt-4">
        {isLoading && <div>Loading...</div>}
        {!data && <span>No Posts found</span>}
        {data &&
          data.map((item) => (
            <Post
              key={item.id}
              post={item}
              me={me?.id as string}
              refetch={refetch}
            />
          ))}
      </div>
    </section>
  );
};
