/* eslint-disable @typescript-eslint/no-unused-vars */
import Post, { PostType } from "@/components/Post";
import { NewPostArea } from "../../../components/NewPostArea";
import { trpc } from "@/lib/trpc";
import { useMe } from "@/lib/ctx";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

export const AllPostsPage = () => {
  const me = useMe();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const { data, error, isLoading, isError, refetch } = trpc.getPosts.useQuery({
    sortOrder,
    searchQuery,
    page: currentPage,
    limit: postsPerPage,
  });

  const totalPages = data ? Math.ceil(data.total / postsPerPage) : 0;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    setCurrentPage(1);
  };

  return (
    <section className="container mx-auto w-full flex flex-col">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Поиск постов..."
          value={searchQuery}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-lg flex-grow bg-white dark:bg-[#363636] dark:border-gray-700"
        />
        <Button
          onClick={handleSort}
          className="flex items-center gap-2 bg-[#37B34A] hover:bg-[#2f9a3f] text-white"
        >
          Сортировать по дате
          {sortOrder === "desc" ? (
            <ArrowDown size={16} />
          ) : (
            <ArrowUp size={16} />
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading && <div>Loading...</div>}
        {!data?.posts.length && <span>No Posts found</span>}
        {data?.posts.map((item) => (
          <Post
            key={item.id}
            post={item}
            me={me?.id as string}
            refetch={refetch}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-[#37B34A] hover:bg-[#2f9a3f] text-white"
          >
            Предыдущая
          </Button>
          <span className="flex items-center">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-[#37B34A] hover:bg-[#2f9a3f] text-white"
          >
            Следующая
          </Button>
        </div>
      )}
    </section>
  );
};
