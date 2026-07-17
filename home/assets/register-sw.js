/**
 * DBDEVSTUDIO - Service Worker registration
 * Production-ready with update handling
 */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/', type: 'module' }).catch(()=>navigator.serviceWorker.register('/sw.js'));
      console.log('SW registered:', reg.scope);

      // Update handling
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // new version available
            console.log('SW new version installed, waiting to activate');
            // optional: show toast "Nowa wersja dostępna - odśwież"
            const toast = document.createElement('div');
            toast.style.cssText='position:fixed;bottom:1rem;right:1rem;background:#24242a;color:#e2e2e8;border:1px solid #2e2e36;padding:1rem 1.25rem;border-radius:1rem;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.4)';
            toast.innerHTML='<div style="font-weight:600">Nowa wersja dostępna</div><div style="font-size:.85rem;color:#9a9aa4;margin:.25rem 0 .5rem">Odśwież aby załadować najnowszą wersję.</div><button id="sw-refresh" class="btn btn-primary" style="padding:.5rem .875rem;font-size:.85rem">Odśwież</button>';
            document.body.appendChild(toast);
            document.getElementById('sw-refresh')?.addEventListener('click', ()=>{
              newWorker.postMessage({type:'SKIP_WAITING'});
              window.location.reload();
            });
          }
        });
      });

      // Listen for controller change -> reload
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

    } catch (err) {
      console.warn('SW registration failed:', err);
    }
  });

  // PWA install prompt
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e=>{
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA install prompt available');
    // could show custom install button
  });
})();
