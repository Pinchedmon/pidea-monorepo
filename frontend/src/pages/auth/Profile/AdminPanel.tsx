/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { saveAs } from "file-saver";
import { trpc } from "@/lib/trpc";

type UserUpdates = {
  name?: string;
  nick?: string;
  email?: string;
  role?: "USER" | "MODERATOR" | "ADMIN";
};
type PostUpdates = { text?: string };
type CommentUpdates = { content?: string };

export function AdminPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [userUpdates, setUserUpdates] = useState<Record<string, UserUpdates>>(
    {}
  );
  const [postUpdates, setPostUpdates] = useState<Record<string, PostUpdates>>(
    {}
  );
  const [commentUpdates, setCommentUpdates] = useState<
    Record<string, CommentUpdates>
  >({});

  // Queries
  const { data: users, refetch: refetchUsers } = trpc.getAllUsers.useQuery();
  const { data: posts, refetch: refetchPosts } = trpc.getAllPosts.useQuery();
  const { data: comments, refetch: refetchComments } =
    trpc.getAllComments.useQuery();

  // Mutations
  const updateUserMutation = trpc.updateUser.useMutation({
    onSuccess: () => refetchUsers(),
    onError: (error) =>
      console.error("Ошибка при обновлении пользователя:", error),
  });

  const updatePostMutation = trpc.updateAdminPost.useMutation({
    onSuccess: () => refetchPosts(),
    onError: (error) => console.error("Ошибка при обновлении поста:", error),
  });

  const updateCommentMutation = trpc.updateAdminComment.useMutation({
    onSuccess: () => refetchComments(),
    onError: (error) =>
      console.error("Ошибка при обновлении комментария:", error),
  });

  // Обработчики изменения данных
  const handleUserChange = (
    userId: string,
    field: keyof UserUpdates,
    value: string
  ) => {
    setUserUpdates((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const handlePostChange = (
    postId: string,
    field: keyof PostUpdates,
    value: string
  ) => {
    setPostUpdates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], [field]: value },
    }));
  };

  const handleCommentChange = (
    commentId: string,
    field: keyof CommentUpdates,
    value: string
  ) => {
    setCommentUpdates((prev) => ({
      ...prev,
      [commentId]: { ...prev[commentId], [field]: value },
    }));
  };

  // Обработчики сохранения
  const handleUserSave = (userId: string) => {
    setIsLoading(true);
    const updates = userUpdates[userId];
    if (updates) {
      updateUserMutation.mutate(
        { id: userId, ...updates },
        {
          onSettled: () => {
            setIsLoading(false);
            setUserUpdates((prev) => {
              const newUpdates = { ...prev };
              delete newUpdates[userId];
              return newUpdates;
            });
          },
        }
      );
    }
  };

  const handlePostSave = (postId: string) => {
    setIsLoading(true);
    const updates = postUpdates[postId];
    if (updates) {
      updatePostMutation.mutate(
        { id: postId, ...updates },
        {
          onSettled: () => {
            setIsLoading(false);
            setPostUpdates((prev) => {
              const newUpdates = { ...prev };
              delete newUpdates[postId];
              return newUpdates;
            });
          },
        }
      );
    }
  };

  const handleCommentSave = (commentId: string) => {
    setIsLoading(true);
    const updates = commentUpdates[commentId];
    if (updates) {
      updateCommentMutation.mutate(
        { id: commentId, ...updates },
        {
          onSettled: () => {
            setIsLoading(false);
            setCommentUpdates((prev) => {
              const newUpdates = { ...prev };
              delete newUpdates[commentId];
              return newUpdates;
            });
          },
        }
      );
    }
  };

  // Экспорт в CSV
  const handleExportCSV = (type: "users" | "posts" | "comments") => {
    let headers = "";
    let rows = "";
    switch (type) {
      case "users":
        headers = "Имя;Никнейм;Роль;Email;Дата регистрации";
        rows =
          users
            ?.map(
              (u) => `${u.name};${u.nick};${u.role};${u.email};${u.createdAt}`
            )
            .join("\n") || "";
        break;
      case "posts":
        headers = "Текст;Автор;Дата создания";
        rows =
          posts
            ?.map((p) => `${p.text};${p.author.name};${p.createdAt}`)
            .join("\n") || "";
        break;
      case "comments":
        headers = "Текст;Автор;Пост;Дата создания";
        rows =
          comments
            ?.map(
              (c) =>
                `${c.content};${c.author.name};${c.post.text};${c.createdAt}`
            )
            .join("\n") || "";
        break;
    }
    const csvContent = `\uFEFF${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${type}.csv`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#37B34A] hover:bg-[#2c9c3c] text-white rounded-3xl w-fit transition-colors duration-200">
          Открыть админ-панель
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] max-h-[80vh] bg-white dark:bg-gray-900 border border-[#37B34A] rounded-lg shadow-xl flex flex-col">
        <DialogHeader className="p-4 border-b border-[#37B34A]">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Админ-панель
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Управление пользователями, постами и комментариями
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-t-lg px-4 py-2">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:text-[#37B34A] text-gray-700 dark:text-gray-300 py-2"
            >
              Пользователи
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:text-[#37B34A] text-gray-700 dark:text-gray-300 py-2"
            >
              Посты
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="data-[state=active]:bg-white data-[state=active]:dark:bg-gray-900 data-[state=active]:text-[#37B34A] text-gray-700 dark:text-gray-300 py-2"
            >
              Комментарии
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Вкладка пользователей */}
            <TabsContent value="users" className="mt-0">
              <div className="space-y-4">
                <Button
                  onClick={() => handleExportCSV("users")}
                  disabled={isLoading}
                  className="bg-[#37B34A] hover:bg-[#2c9c3c] text-white transition-colors duration-200"
                >
                  Экспорт пользователей в CSV
                </Button>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Имя
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Ник
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Роль
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users?.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                        >
                          <td className="px-4 py-3">
                            <input
                              value={userUpdates[user.id]?.name ?? user.name}
                              onChange={(e) =>
                                handleUserChange(
                                  user.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:ring-2 focus:ring-[#37B34A]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={userUpdates[user.id]?.nick ?? user.nick}
                              onChange={(e) =>
                                handleUserChange(
                                  user.id,
                                  "nick",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:ring-2 focus:ring-[#37B34A]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={userUpdates[user.id]?.email ?? user.email}
                              onChange={(e) =>
                                handleUserChange(
                                  user.id,
                                  "email",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:ring-2 focus:ring-[#37B34A]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={userUpdates[user.id]?.role ?? user.role}
                              onChange={(e) =>
                                handleUserChange(
                                  user.id,
                                  "role",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:ring-2 focus:ring-[#37B34A]"
                            >
                              <option value="USER">Пользователь</option>
                              <option value="ADMIN">Админ</option>
                              <option value="MODERATOR">Модератор</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            <Button
                              onClick={() => handleUserSave(user.id)}
                              disabled={isLoading || !userUpdates[user.id]}
                              className="bg-[#37B34A] hover:bg-[#2c9c3c] text-white"
                            >
                              Сохранить
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                            >
                              Удалить
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Вкладка постов */}
            <TabsContent value="posts" className="mt-0">
              <div className="space-y-4">
                <Button
                  onClick={() => handleExportCSV("posts")}
                  disabled={isLoading}
                  className="bg-[#37B34A] hover:bg-[#2c9c3c] text-white transition-colors duration-200"
                >
                  Экспорт постов в CSV
                </Button>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Текст
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Автор
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {posts?.map((post) => (
                        <tr
                          key={post.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                        >
                          <td className="px-4 py-3">
                            <textarea
                              value={postUpdates[post.id]?.text ?? post.text}
                              onChange={(e) =>
                                handlePostChange(
                                  post.id,
                                  "text",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:ring-2 focus:ring-[#37B34A] resize-y min-h-[60px]"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                            {post.author.name}
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            <Button
                              onClick={() => handlePostSave(post.id)}
                              disabled={isLoading || !postUpdates[post.id]}
                              className="bg-[#37B34A] hover:bg-[#2c9c3c] text-white"
                            >
                              Сохранить
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                            >
                              Удалить
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Вкладка комментариев */}
            <TabsContent value="comments" className="mt-0">
              <div className="space-y-4">
                <Button
                  onClick={() => handleExportCSV("comments")}
                  disabled={isLoading}
                  className="bg-[#37B34A] hover:bg-[#2c9c3c] text-white transition-colors duration-200"
                >
                  Экспорт комментариев в CSV
                </Button>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Текст
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Автор
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Пост
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {comments?.map((comment) => (
                        <tr
                          key={comment.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                        >
                          <td className="px-4 py-3">
                            <textarea
                              value={
                                commentUpdates[comment.id]?.content ??
                                comment.content
                              }
                              onChange={(e) =>
                                handleCommentChange(
                                  comment.id,
                                  "content",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:ring-2 focus:ring-[#37B34A] resize-y min-h-[60px]"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                            {comment.author.name}
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                            {comment.post.text}
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            <Button
                              onClick={() => handleCommentSave(comment.id)}
                              disabled={
                                isLoading || !commentUpdates[comment.id]
                              }
                              className="bg-[#37B34A] hover:bg-[#2c9c3c] text-white"
                            >
                              Сохранить
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                            >
                              Удалить
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
