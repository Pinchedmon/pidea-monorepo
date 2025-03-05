import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export const ModerationPanel = () => {
  const { data: pendingPosts, refetch } = trpc.getPendingPosts.useQuery();
  const moderatePost = trpc.moderatePost.useMutation({
    onSuccess: () => refetch(),
  });

  const handleModerate = (postId: string, status: "APPROVED" | "REJECTED") => {
    moderatePost.mutate({ postId, status });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Очередь модерации</h2>
      {!pendingPosts || pendingPosts.length === 0 ? (
        <p className="text-gray-500">Нет постов на модерацию</p>
      ) : (
        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 bg-white dark:bg-[#2C2C2C] rounded-xl border-2 border-black/10 dark:border-white/10"
            >
              <p className="font-bold">{post.author.name}</p>
              <p className="mt-2">{post.text}</p>
              <p className="text-sm text-gray-500 mt-1">Тема: {post.theme}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleModerate(post.id, "APPROVED")}
                  disabled={moderatePost.isPending}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                >
                  <Check size={16} />
                  Одобрить
                </Button>
                <Button
                  onClick={() => handleModerate(post.id, "REJECTED")}
                  disabled={moderatePost.isPending}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
                >
                  <X size={16} />
                  Отклонить
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
