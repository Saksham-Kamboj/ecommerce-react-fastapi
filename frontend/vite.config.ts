import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "")

  // Extract just the origin (e.g. http://localhost:8000) from the full base URL
  const apiBaseUrl = env.VITE_API_BASE_URL
  const targetUrl = new URL(apiBaseUrl).origin

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: targetUrl,
          changeOrigin: true,
        },
        "/uploads": {
          target: targetUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
