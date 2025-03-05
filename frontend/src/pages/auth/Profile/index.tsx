/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMe } from "@/lib/ctx";
import { EditProfile } from "./EditProfile";
import { useLocation } from "react-router";
import { trpc } from "@/lib/trpc";
import Post from "@/components/Post";
import { AdminPanel } from "./AdminPanel";

const ProfilePage = () => {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const userId = search.get("id");

  const me = useMe();
  const { data: profile, isLoading: loadingProfile } = userId
    ? trpc.getProfile.useQuery({ id: userId })
    : trpc.getProfile.useQuery({ id: me?.id as string });

  const { data: posts, refetch } = trpc.getPostsForProfile.useQuery({
    id: profile?.id as string, // Используем опциональную цепочку
  });

  if (loadingProfile) {
    return <p>Loading profile...</p>; // Показать индикатор загрузки
  }

  if (!profile) {
    return <p>Profile not found.</p>; // Обработка случая, когда профиль не найден
  }

  return (
    <>
      <section className="container mx-auto flex gap-4 flex-col">
        <div className="w-full bg-white dark:bg-[#2c2c2c] rounded-3xl p-6 h-[180px] relative overflow-hidden border-2 border-black/10 dark:border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20"></div>
          <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">
            Профиль
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Добро пожаловать в ваш персональный профиль
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-white dark:bg-[#2c2c2c] rounded-3xl p-6 flex flex-col items-center border-2 border-black/10 dark:border-white/10">
            <Avatar className="w-40 h-40 border-4 border-green-600 shadow-lg">
              <AvatarImage
                src={`http://localhost:3001${profile.avatarUrl}`}
                alt="User  Avatar"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-black dark:text-white">
                {profile.name}
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                @{profile.nick}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-3xl p-6 border-2 border-black/10 dark:border-white/10">
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
                Информация
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center">
                    <span>📧</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {profile.email || "Нет email"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <span>📅</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Дата регистрации:{" "}
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "Неизвестно"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#2c2c2c] rounded-3xl p-6 border-2 border-black/10 dark:border-white/10">
              <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
                Статистика
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-[#363636] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {posts?.length || 0}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">Постов</p>
                </div>
                <div className="bg-gray-100 dark:bg-[#363636] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-500">0</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Подписчиков
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* @ts-ignore */}
        <EditProfile profile={profile} refetchProfile={refetch} />
        {me?.role == "ADMIN" && <AdminPanel />}
        <p className="rounded-3xl font-semibold bg-white dark:bg-[#2c2c2c] my-4 w-fit p-3 text-lg border-2 border-green-600 text-black dark:text-white">
          Посты
        </p>
        {posts &&
          posts.map((item: any) => (
            <Post
              key={item.id}
              post={item}
              me={me?.id as string}
              refetch={refetch}
            />
          ))}
      </section>
    </>
  );
};

export default ProfilePage;
