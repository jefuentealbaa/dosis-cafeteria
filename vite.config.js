import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    host: "localhost",
    port: 3000
  },
  preview: {
    host: "localhost",
    port: 3001
  }
});
