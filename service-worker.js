const CACHE_NAME = "yit-beta-cache-BETA-1.3";

const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-512-BETA.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_FILES).catch(() => Promise.resolve());
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key.startsWith("yit-beta-cache-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  if (
    req.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html")
  ) {
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return response;
      });
    })
  );
});
