import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

// Exposes the product files in ./deliverables to server code as the virtual module
// "virtual:deliverables" — a map of file name → base64 content, embedded at build time.
//
// The files are paid content, so they must never reach the browser bundle: for any
// non-server environment the module resolves to an empty map. Only server functions
// (src/lib/library.functions.ts → src/lib/deliverables.server.ts) import it, and they
// hand a file out only after checking that the logged-in buyer has a paid order for it.
const VIRTUAL_ID = "virtual:deliverables";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

export function deliverablesPlugin(dir = "deliverables"): Plugin {
  const root = path.resolve(dir);
  return {
    name: "vertice-deliverables",
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id, options) {
      if (id !== RESOLVED_ID) return undefined;
      const consumer = (this as { environment?: { config?: { consumer?: string } } }).environment
        ?.config?.consumer;
      const isServer = consumer ? consumer === "server" : Boolean(options?.ssr);
      if (!isServer) return "export default {};";

      const files: Record<string, string> = {};
      for (const name of readdirSync(root)) {
        const full = path.join(root, name);
        if (!statSync(full).isFile()) continue;
        this.addWatchFile(full);
        files[name] = readFileSync(full).toString("base64");
      }
      return `export default ${JSON.stringify(files)};`;
    },
  };
}
