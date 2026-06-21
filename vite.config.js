import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.VITE_API_BASE_URL?.trim();
  const baseUrl = env.VITE_BASE_URL?.trim();

  if (
    mode === "production" &&
    (!apiBaseUrl || /https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(apiBaseUrl))
  ) {
    throw new Error(
      "Production builds require VITE_API_BASE_URL to point to a deployed HTTPS backend."
    );
  }

  return {
    plugins: [react()],
    base: mode === "production" ? baseUrl || "/mini-project/" : "/",
    server: {
      proxy:
        mode !== "production"
          ? {
              "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, "/api")
              }
            }
          : undefined
    }
  };
});
