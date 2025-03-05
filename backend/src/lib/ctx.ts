import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const createAppContext = (req?: Request, res?: Response) => {
  const prisma = new PrismaClient();
  return {
    prisma,
    me: req?.user,
    req,
    res,
    stop: async () => {
      await prisma.$disconnect();
    },
  };
};

export type AppContext = ReturnType<typeof createAppContext>;
