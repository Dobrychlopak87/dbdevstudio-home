const CACHE_NAME = 'dbdevstudio-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/assets/app.css',
  '/assets/fonts.css',
  '/assets/fonts/inter.woff2',
  '/assets/fonts/space-grotesk.woff2',
  '/icons/dbdevstudio-favicon-v2.ico',
  '/icons/dbdevstudio-192-v2.png',
  '/icons/dbdevstudio-512-v2.png',
  '/images/placeholders/nano4hr/hero.avif',
  '/images/placeholders/nano4hr/detail.avif'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});
