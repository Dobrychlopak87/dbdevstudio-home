/**
 * DBDEVSTUDIO - Service Worker v2026.07.17 production
 * Strategy: Cache-first for assets, Network-first for HTML/API, offline fallback
 */
const CACHE_NAME = 'dbdevstudio-v2026-07-17-1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/app.css',
  '/assets/app.js',
  '/assets/fonts.css',
  '/assets/enhancements.js',
  '/assets/register-sw.js',
  '/assets/password-reset.js',
  '/assets/fonts/inter.woff2',
  '/assets/fonts/space-grotesk.woff2',
  '/icons/dbdevstudio-favicon-v2.ico',
  '/icons/dbdevstudio-48-v2.png',
  '/icons/dbdevstudio-96-v2.png',
  '/icons/dbdevstudio-192-v2.png',
  '/icons/dbdevstudio-512-v2.png',
  '/icons/dbdevstudio-maskable-192-v2.png',
  '/icons/dbdevstudio-maskable-512-v2.png',
  '/images/hero/hero-www.webp',
  '/images/hero/hero-apps.webp',
  '/images/hero/hero-design.webp',
  '/images/hero/hero-seo.webp',
  '/manifest.json'
];

// Install - precache
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' }))).catch(err=>{
        console.warn('Precache fail', err);
        // try individual
        return Promise.allSettled(PRECACHE_URLS.map(u=>cache.add(u)));
      }))
  );
});

// Activate - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k=>k!==CACHE_NAME).map(k=>{
          console.log('Deleting old cache', k);
          return caches.delete(k);
        })
      )
    ).then(()=>self.clients.claim())
  );
});

// Helper to determine request type
function isAssetRequest(req){
  const url = new URL(req.url);
  return url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/');
}
function isApiRequest(req){
  return req.url.includes('/api.php');
}
function isNavigationRequest(req){
  return req.mode==='navigate' || (req.method==='GET' && req.headers.get('accept')?.includes('text/html'));
}

// Fetch strategy
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method!=='GET') return; // let POST through

  if (isApiRequest(req)) {
    // Network only for API
    event.respondWith(fetch(req).catch(()=> new Response(JSON.stringify({success:false,message:'Offline'}), {status:503, headers:{'Content-Type':'application/json'}})));
    return;
  }

  if (isAssetRequest(req)) {
    // Cache first, then network, update cache
    event.respondWith(
      caches.match(req).then(cached=>{
        const networkFetch = fetch(req).then(networkRes=>{
          if (networkRes && networkRes.status===200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(req, clone));
          }
          return networkRes;
        }).catch(()=>cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  if (isNavigationRequest(req)) {
    // Network first, fallback to cache, then offline page
    event.respondWith(
      fetch(req).then(res=>{
        // cache HTML
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(req, clone));
        return res;
      }).catch(async ()=>{
        const cached = await caches.match(req);
        if (cached) return cached;
        // fallback to index.html for SPA routing
        const index = await caches.match('/index.html') || await caches.match('/');
        if (index) return index;
        return new Response('<h1>Offline</h1><p>Jesteś offline. Sprawdź połączenie.</p>', {headers:{'Content-Type':'text/html'}});
      })
    );
    return;
  }

  // Default: cache-first for others
  event.respondWith(
    caches.match(req).then(cached=>{
      return cached || fetch(req).then(res=>{
        if (res && res.status===200 && res.type==='basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(req, clone));
        }
        return res;
      });
    })
  );
});

// Message handling for SKIP_WAITING
self.addEventListener('message', event=>{
  if (event.data && event.data.type==='SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync placeholder (future)
self.addEventListener('sync', event=>{
  if (event.tag==='contact-sync') {
    console.log('Background sync contact');
  }
});
