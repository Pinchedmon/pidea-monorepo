import { type User } from "@prisma/client";
import { type Request } from "express";
import { z } from "zod";

export type ExpressRequest = Request & {
  user: User | undefined;
};
// Схемы ввода для валидации данных
export const zPostInput = z.object({
  id: z.string(), // Для редактирования или удаления
  text: z.string().min(1, "Text is required"),
  theme: z.enum(["IT", "MEDIA", "TECH"]),
});

export const zCommentInput = z.object({
  id: z.string().optional(), // Для редактирования или удаления
  postId: z.string(), // ID поста
  content: z.string().min(1, "Content is required"),
});
