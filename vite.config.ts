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
  // Hard-pin Vercel as the deploy target instead of relying on Nitro's
  // cloudflare-module fallback (which local builds hit with no platform env vars set).
  nitro: {
    preset: "vercel",
    // google-gax (a firebase-admin/@google-cloud/firestore dependency) locates its .proto
    // files at runtime via `path.join(__dirname, ...)`. Bundling it into one flat ESM chunk
    // both breaks that __dirname reference ("ReferenceError: __dirname is not defined in ES
    // module scope", crashing every SSR request) and leaves the actual .proto files behind.
    // traceDeps keeps these as real, untouched packages on disk instead of bundling them —
    // this option is real nitro config (see node_modules/nitro/dist/docs), just not in this
    // wrapper's narrower TS surface, hence the ts-expect-error below.
    // @ts-expect-error — traceDeps isn't in LovableViteTanstackOptions["nitro"]'s type, but it
    // is spread straight into nitro()'s real options at runtime.
    traceDeps: ["firebase-admin", "@google-cloud/firestore", "@google-cloud/storage", "google-gax*"],
  },
});
