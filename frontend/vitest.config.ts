/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // Для тестирования React-компонентов
    setupFiles: ["./vitest.setup.ts"],
    globals: true, // Глобальные функции like `describe`, `it`, `expect`
    deps: {
      inline: ["vitest"], // Улучшает совместимость с Vite
    },
  },
});
