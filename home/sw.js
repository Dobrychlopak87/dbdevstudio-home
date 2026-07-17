const CACHE_NAME = 'dbdevstudio-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/assets/app.js',
  '/assets/app.css',
  '/assets/fonts.css',
  '/assets/enhancements.js',
  '/icons/dbdevstudio-favicon-v2.ico',
  '/icons/dbdevstudio-192-v2.png',
  '/icons/dbdevstudio-512-v2.png',
  '/images/placeholders/blog/restauracja.avif',
  '/images/placeholders/blog/sklep-osiedlowy.avif',
  '/images/placeholders/blog/skrzynka-firmowa.avif',
  '/images/placeholders/blog/slownik-pojec.avif'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(ASSETS_TO_CACHE.map((asset) => cache.add(asset))))
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
  if (event.request.method !== 'GET') return;

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
