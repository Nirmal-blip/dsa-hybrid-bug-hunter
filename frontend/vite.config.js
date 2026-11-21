import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase =
    env.API_BASE || process.env.API_BASE || "http://localhost:8000/api";

  return {
    plugins: [react(), tailwindcss()],
    define: {
      "import.meta.env.API_BASE": JSON.stringify(apiBase),
    },
  };
});