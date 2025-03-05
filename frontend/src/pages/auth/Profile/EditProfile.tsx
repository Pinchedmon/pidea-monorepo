import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";

interface Profile {
  id: string;
  name: string;
  nick: string;
  avatarUrl?: string;
}

interface EditProfileProps {
  profile: Profile;
  refetchProfile: () => void;
}

export function EditProfile({ profile, refetchProfile }: EditProfileProps) {
  const [name, setName] = useState(profile?.name || "");
  const [nick, setNick] = useState(profile?.nick || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatarUrl || null
  );

  const handleAvatarSelect = (file: File) => {
    setAvatar(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", avatar!); // Убедитесь, что avatar не null
      formData.append("nick", nick);
      formData.append("name", name);
      formData.append("id", profile.id);

      console.log("Submitting profile update:", { name, nick, avatar });

      // Отправляем данные на сервер
      const response = await axios.post(
        "http://localhost:3001/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Profile updated:", response.data);
      refetchProfile(); // Обновляем профиль после успешного обновления
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-white dark:bg-[#2c2c2c] w-fit flex gap-4 border border-[#37B34A] text-[#2c2c2c] dark:text-white rounded-3xl hover:bg-gray-100 dark:hover:bg-[#363636]">
          Редактировать
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#1c1c1c] border border-[#37B34A]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2c2c2c] dark:text-white">
            Редактировать профиль
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Настройте свой профиль
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="flex flex-col gap-4 items-center">
            {avatarPreview && (
              <img
                src={
                  profile.avatarUrl
                    ? `http://localhost:3001${avatarPreview}`
                    : avatarPreview
                }
                alt="Avatar Preview"
                className="w-24 h-24 border-2 border-[#37B34A]"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleAvatarSelect(file);
                }
              }}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="flex items-center gap-2 bg-[#37B34A] hover:bg-[#2f9a3f] text-white cursor-pointer p-2 rounded"
            >
              Загрузить аватар
            </label>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="username"
              className="text-right text-[#2c2c2c] dark:text-white"
            >
              Имя
            </Label>
            <Input
              id="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-white dark:bg-[#2c2c2c] border-[#37B34A] text-[#2c2c2c] dark:text-white"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="nick"
              className="text-right text-[#2c2c2c] dark:text-white"
            >
              Никнейм
            </Label>
            <Input
              id="nick"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              className="col-span-3 bg-white dark:bg-[#2c2c2c] border-[#37B34A] text-[#2c2c2c] dark:text-white"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-[#37B34A] hover:bg-[#2c9c3c] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
