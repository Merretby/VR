// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    // Build for the Vercel serverless runtime, not the default Cloudflare target.
    // Without an explicit preset, the build falls back to cloudflare-module and
    // Vercel runs it as a Node function, crashing on env.ASSETS.
    preset: "vercel",
    // Rollup/rolldown splits the TanStack Start + CSRF middleware into two
    // chunks with a circular import; at module scope createCsrfMiddleware
    // resolves to undefined and every request 500s. Inline everything into a
    // single chunk to keep evaluation order correct.
    // Not part of the wrapper's public nitro typings, but it is forwarded to
    // the nitro() plugin at runtime.
    inlineDynamicImports: true,
  } as { preset: "vercel"; inlineDynamicImports: boolean },
});
