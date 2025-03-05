import express from "express";
import path from "path";

import cors from "cors";
import { trpcRouter } from "./router";
import { env } from "process";
import { AppContext, createAppContext } from "./lib/ctx";
import { applyTrpcToExpressApp } from "./lib/trpc";
import { applyPassportToExpressApp } from "./lib/passport";
import multer from "multer";

void (async () => {
  let ctx: AppContext | null = null;
  try {
    ctx = createAppContext();
    //await presetDb(ctx)
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "uploads/"); // Make sure this directory exists
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
      },
    });

    const upload = multer({ storage: storage });

    const expressApp = express();
    expressApp.use(cors());
    expressApp.get("/ping", (req, res) => {
      res.send("pong");
    });

    applyPassportToExpressApp(expressApp, ctx);

    await applyTrpcToExpressApp(expressApp, ctx, trpcRouter);
    expressApp.post("/upload", upload.single("avatar"), async (req, res) => {
      try {
        // @ts-ignore

        const { nick, name, id } = req.body; // Получаем данные из тела запроса
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Получаем путь к загруженному изображению

        // Обновляем данные пользователя в базе данных
        const user = await ctx!.prisma.user.update({
          // @ts-ignore
          where: { id: id },
          data: {
            nick: nick,
            name: name,
            avatarUrl: imagePath, // Обновляем URL аватара
          },
        });

        // Отправляем ответ с обновленными данными пользователя
        res.json(user);
      } catch (error) {
        console.error("Ошибка при загрузке аватара:", error);
        res.status(500).json({ error: "Ошибка при загрузке аватара" });
      }
    });

    expressApp.use("/uploads", express.static("uploads"));
    expressApp.listen(env.PORT, () => {
      console.info(`Listening at http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error(error);
    await ctx?.stop();
  }
})();
