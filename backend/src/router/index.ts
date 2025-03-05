import path from "path";
import fs from "fs";
import multer, { StorageEngine } from "multer";
import { Request, Response } from "express";
import { FileFilterCallback } from "multer";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { trpc } from "../lib/trpc";

import { getMeTrpcRoute } from "./auth/getMe";
import { signUpTrpcRoute } from "./auth/signUp";
import { signInTrpcRoute } from "./auth/signIn";
import { getPostsTrpcRoute } from "./posts/getPosts";
import { updatePostTrpcRoute } from "./posts/editPost";
import { deletePostTrpcRoute } from "./posts/deletePost";
import { createPostTrpcRoute } from "./posts/createPost/index";
import { createCommentTrpcRoute } from "./comments/createComments";
import { deleteCommentTrpcRoute } from "./comments/deleteComments";
import { updateCommentTrpcRoute } from "./comments/editComments";
import { getPostTrpcRoute } from "./posts/getPost";
import { setPostLikeTrpcRoute } from "./posts/setPostLike";
import {
  getPostsForProfileTrpcRoute,
  getPostsWithThemeTrpcRoute,
} from "./posts/getPostsWithTheme";
import { getProfileTrpcRoute } from "./profile/getProfile";
import { updateProfileTrpcRoute } from "./auth/updateProfile";
import {
  deleteUserRoute,
  editUserRoute,
  getAllUsersRoute,
} from "./auth/getUsers";

const t = trpc;

type MulterFile = Express.Multer.File;
type UploadContext = { req: Request; res: Response };
type UploadResponse = { url: string };

// Создаем папку для загрузок, если её нет
const uploadDir = path.join(__dirname, "../../uploads/avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// export const multerUpload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     allowedTypes.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new Error("Invalid file type"));
//   },
// });
const upload = multer({ storage });

export const uploadAvatarTrpcRoute = trpc.procedure
  .input(z.object({}))
  .mutation(async ({ ctx }) => {
    return new Promise((resolve, reject) => {
      upload.single("avatar")(ctx.req, ctx.res, (err) => {
        if (err) {
          return reject(new Error("Upload failed"));
        }
        console.log(ctx);
        const filePath = `/uploads/avatars/${ctx.req.file?.filename}`;
        resolve({ url: filePath });
      });
    });
  });

export const trpcRouter = t.router({
  getPosts: getPostsTrpcRoute,
  getPosts1: trpc.procedure.query(async ({ ctx }) => {
    return await ctx.prisma.post.findMany({
      where: { status: "APPROVED" },
      include: { author: true },
    });
  }),

  getCommentsByPostId: trpc.procedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.comment.findMany({
        where: { postId: input.postId },
        include: { author: true },
      });
    }),
  getPost: getPostTrpcRoute,
  getPostsForProfile: getPostsForProfileTrpcRoute,
  getPostsWithTheme: getPostsWithThemeTrpcRoute,
  updatePost: updatePostTrpcRoute,
  deletePost: deletePostTrpcRoute,
  createPost: createPostTrpcRoute,

  setPostLike: setPostLikeTrpcRoute,
  createComment: createCommentTrpcRoute,
  deleteComment: deleteCommentTrpcRoute,
  updateComment: updateCommentTrpcRoute,
  getProfile: getProfileTrpcRoute,
  updateProfile: updateProfileTrpcRoute,
  getMe: getMeTrpcRoute,
  signUp: signUpTrpcRoute,
  signIn: signInTrpcRoute,
  uploadAvatar: uploadAvatarTrpcRoute,
  getAllUsers: getAllUsersRoute,
  moderatePost: trpc.procedure
    .input(
      z.object({
        postId: z.string(),
        status: z.enum(["APPROVED", "REJECTED"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Проверка прав модератора
      if (!ctx.me || (ctx.me.role !== "MODERATOR" && ctx.me.role !== "ADMIN")) {
        throw new Error("Unauthorized");
      }
      return ctx.prisma.post.update({
        where: { id: input.postId },
        data: { status: input.status },
      });
    }),
  getPendingPosts: trpc.procedure.query(async ({ ctx }) => {
    return ctx.prisma.post.findMany({
      where: { status: "PENDING" },
      include: { author: { select: { name: true } } },
    });
  }),
  getAllComments: trpc.procedure.query(async ({ ctx }) => {
    return ctx.prisma.comment.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            nick: true,
          },
        },
        post: {
          select: {
            text: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  getAllPosts: trpc.procedure.query(async ({ ctx }) => {
    return ctx.prisma.post.findMany({
      select: {
        id: true,
        text: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            nick: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  updateUser: trpc.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        nick: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          nick: input.nick,
          email: input.email,
          role: input.role,
        },
      });
    }),

  updateAdminPost: trpc.procedure
    .input(
      z.object({
        id: z.string(),
        text: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.post.update({
        where: { id: input.id },
        data: { text: input.text },
      });
    }),

  updateAdminComment: trpc.procedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.comment.update({
        where: { id: input.id },
        data: { content: input.content },
      });
    }),

  editUser: editUserRoute,
  deleteUser: deleteUserRoute,
});

export type TrpcRouter = typeof trpcRouter;
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>;
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>;
