import { initTRPC } from "@trpc/server";
import { AppContext } from "./ctx";
import * as trpcExpress from "@trpc/server/adapters/express";
import { ExpressRequest } from "../utils/types";
import { TrpcRouter } from "../router";
import { type Express } from "express";
import superjson from "superjson";

// Функция для создания контекста TRPC
const getCreateTrpcContext =
  (appContext: AppContext) =>
  ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
    ...appContext,
    req, // Передаем req
    res, // Передаем res
    me: (req as ExpressRequest).user || null,
  });

// Определение типа контекста TRPC
export type TrpcContext = ReturnType<typeof getCreateTrpcContext>;

// Инициализация TRPC с контекстом и трансформером
export const trpc = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

// Функция для применения TRPC к Express приложению
export const applyTrpcToExpressApp = async (
  expressApp: Express,
  appContext: AppContext,
  trpcRouter: TrpcRouter
) => {
  expressApp.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext: getCreateTrpcContext(appContext),
    })
  );
};
