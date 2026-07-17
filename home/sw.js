const CACHE_NAME = 'dbdevstudio-v5';
const SHELL = ['/', '/index.html', '/assets/app.js?v=20260711-4', '/assets/app.css', '/assets/fonts.css', '/manifest.json?v=2', '/icons/dbdevstudio-192-v2.png', '/icons/dbdevstudio-maskable-192-v2.png', '/icons/dbdevstudio-apple-touch-v2.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api.php')) return;
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(response => {
    if (response.ok && new URL(e.request.url).origin === self.location.origin) caches.open(CACHE_NAME).then(c => c.put(e.request, response.clone()));
    return response;
  }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('/index.html') : Response.error()))));
});
