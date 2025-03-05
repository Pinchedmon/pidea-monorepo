# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем pnpm глобально
RUN npm install -g pnpm

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json, pnpm-lock.yaml (если есть)
COPY package.json ./
COPY pnpm-lock.yaml ./

# Устанавливаем зависимости с помощью pnpm
RUN pnpm install

# Копируем весь код фронтенда
COPY . .

# Собираем приложение для продакшна
RUN pnpm run build

# Указываем порт для Vite preview
EXPOSE 5173

# Команда для запуска приложения
CMD ["pnpm", "run", "dev"]