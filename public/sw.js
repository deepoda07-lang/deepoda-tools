const CACHE = "deepoda-tools-v1";
const STATIC = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Only handle GET requests for same origin or CDN assets
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Skip API, analytics, ffmpeg CDN
  if (url.pathname.startsWith("/api/") || url.hostname.includes("google") || url.hostname.includes("ffmpeg")) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      }).catch(() => cached ?? new Response("Offline", { status: 503 }));
    })
  );
});
