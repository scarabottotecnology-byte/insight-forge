import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Absolute origin of the current request. Social crawlers require absolute
 * og:image / twitter:image URLs, so build them from this value.
 */
export const getRequestOrigin = createServerFn({ method: "GET" }).handler(() => {
  const req = getRequest();
  const url = new URL(req.url);
  // x-forwarded-host is proxy-sanitized only behind the sandbox localhost rewrite;
  // elsewhere it is client-spoofable, so trust the request URL.
  const sandboxHost = url.hostname === "localhost" ? req.headers.get("x-forwarded-host") : null;
  return sandboxHost ? `https://${sandboxHost}` : url.origin;
});

/**
 * Same as getRequestOrigin, but safe to call from a route loader that can also
 * run client-side (e.g. on client navigation with defaultPreloadStaleTime: 0).
 * On a static deploy (no server to answer the server-fn RPC, e.g. GitHub Pages)
 * that call rejects — fall back to the browser's own origin instead of failing
 * the whole loader.
 */
export const getOrigin = () =>
  getRequestOrigin().catch(() => (typeof window !== "undefined" ? window.location.origin : ""));
