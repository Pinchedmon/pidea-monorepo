FROM node:18

# Устанавливаем pnpm глобально
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

# Создаем папку для загрузок (multer)
RUN mkdir -p /app/uploads

# Генерируем Prisma-клиент
RUN npx prisma generate

EXPOSE 3000

# Применяем миграции, выполняем seed.js, затем запускаем приложение
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && pnpm dev"]

#docker compose up -d
#docker exec -it backend-1 bash  
#npx prisma migrate dev --name init
#npx prisma studio
