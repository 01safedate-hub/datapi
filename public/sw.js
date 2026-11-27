/* Alaba service worker — offline fallback + fast repeat visits. */
const VERSION = "alaba-v2";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/logo.png", "/icons/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

const isStatic = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/_next/image") ||
  url.pathname.startsWith("/products/") ||
  url.pathname.startsWith("/icons/");

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/")) return;

  // Pages: network first, fall back to a cached copy, then the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match(OFFLINE_URL))),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (isStatic(url)) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
