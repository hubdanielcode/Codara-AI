import { defineConfig } from "vitest/config";
import { loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

type DevResponse = {
  status: (code: number) => DevResponse;
  json: (payload: unknown) => void;
};

/* - Em desenvolvimento, serve /api/ai com o mesmo código que roda na Vercel - */

const devApi = (): Plugin => ({
  name: "dev-api",

  configureServer(server) {
    server.middlewares.use("/api/ai", async (req, res) => {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ""));

      const chunks: Buffer[] = [];

      for await (const chunk of req) chunks.push(chunk as Buffer);

      let body: unknown;

      try {
        body = JSON.parse(Buffer.concat(chunks).toString() || "null");
      } catch {
        body = undefined;
      }

      const apiResponse: DevResponse = {
        status(code) {
          res.statusCode = code;
          return apiResponse;
        },
        json(payload) {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
        },
      };

      const mod = await server.ssrLoadModule("/api/ai.ts");

      await mod.default(
        { method: req.method, headers: req.headers, body },
        apiResponse,
      );
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: true,
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts",

    /* - Nos testes, usa uma única cópia do react-router (evita contextos duplicados) - */
    alias: {
      "react-router-dom": "react-router",
    },
  },
});
