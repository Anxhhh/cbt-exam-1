import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // DO NOT affect build output
  base: command === "build" ? "/cbt-exam-1/" : "/",

  // DEV-ONLY fix for Electron white screen
  server: command === "serve"
    ? {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
    }
    : undefined,
}));
