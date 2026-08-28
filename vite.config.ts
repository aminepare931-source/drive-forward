import { defineConfig, loadEnv, type Plugin, type UserConfig, type ViteDevServer } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Dev-only: forward TanStack server-fn errors to the browser via HMR WebSocket.
function devServerFnErrorLogger(): Plugin {
  const HMR_SEND_KEY = "__TANSTACK_SERVER_FN_HMR_SEND__";
  return {
    name: "dev-server-fn-error-logger",
    apply: "serve",
    enforce: "pre",
    configureServer(server: ViteDevServer) {
      (globalThis as Record<string, unknown>)[HMR_SEND_KEY] = (data: unknown) => {
        server.ws.send({ type: "custom", event: "server-fn-error", data });
      };
    },
    transform(code: string, id: string) {
      const normalizedId = id.replace(/\\/g, "/");
      if (
        !normalizedId.includes("/@tanstack/start-server-core/src/server-functions-handler.ts") &&
        !normalizedId.includes("/@tanstack/start-server-core/dist/esm/server-functions-handler.js")
      ) {
        return null;
      }
      const needle = "const unwrapped = res.result || res.error";
      if (!code.includes(needle)) return null;
      const injection = [
        "      if (res?.error) {",
        "        const err = res.error;",
        "        const payload = {",
        "          source: 'tanstack',",
        "          type: 'server-fn-error',",
        "          method: request.method,",
        "          url: request.url,",
        "          name: err?.name ?? 'Error',",
        "          message: err?.message ?? String(err),",
        "          stack: typeof err?.stack === 'string' ? err.stack : undefined,",
        "        };",
        "        globalThis.__TANSTACK_SERVER_FN_HMR_SEND__?.(payload);",
        "      }",
      ].join("\n");
      return code.replace(needle, needle + "\n\n" + injection);
    },
  };
}

export default defineConfig((env): UserConfig => {
  const { command, mode } = env;

  // Inject VITE_* env vars into import.meta.env.
  const envDefine: Record<string, string> = {};
  const loaded = loadEnv(mode, process.cwd(), "VITE_");
  for (const key of Object.keys(loaded)) {
    envDefine["import.meta.env." + key] = JSON.stringify(loaded[key]);
  }

  const config: UserConfig = {
    define: envDefine,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": process.cwd() + "/src" },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      devServerFnErrorLogger(),
      tanstackStart({
        importProtection: {
          behavior: "error",
          client: {
            files: ["**/server/**"],
            specifiers: ["server-only"],
          },
        },
        // Redirect TanStack Start's bundled server entry to src/server.ts.
        server: { entry: "server" },
      }),
      viteReact(),
      // Nitro for production builds (Vercel target).
      ...(command === "build"
        ? [
            nitro({
              defaultPreset: "vercel",
            }),
          ]
        : []),
    ],
    server: {
      host: "::",
      port: 8080,
    },
  };
  return config;
});