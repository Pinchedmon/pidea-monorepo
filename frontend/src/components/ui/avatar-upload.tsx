import { ChangeEvent, useRef } from "react";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Upload } from "lucide-react";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onFileSelect: (file: File) => void;
}

export const AvatarUpload = ({
  currentAvatarUrl,
  onFileSelect,
}: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      console.log(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-24 h-24 border-2 border-[#37B34A]">
        {currentAvatarUrl ? (
          <AvatarImage src={currentAvatarUrl} alt="Avatar" />
        ) : (
          <AvatarFallback>NO</AvatarFallback>
        )}
      </Avatar>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 bg-[#37B34A] hover:bg-[#2f9a3f] text-white"
      >
        <Upload size={16} />
        Загрузить аватар
      </Button>
    </div>
  );
};
