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

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'framer-motion'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-utils': ['lucide-react', 'clsx', 'tailwind-merge', 'papaparse', 'canvas-confetti'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable', 'html2canvas']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
}));
