/**
 * DBDEVSTUDIO - Enhancements
 * SEO fallback, a11y, performance, analytics consent
 * Version: 2026-07-17.1 - Production
 */
(() => {
  'use strict';

  // 1. Connect labels for a11y (redundant with app.js but safe)
  function connectLabels(root=document){
    root.querySelectorAll('label:not([for])').forEach(label=>{
      const field = label.parentElement?.querySelector('input,select,textarea');
      if (field) {
        if (!field.id) field.id = 'field-'+Math.random().toString(36).slice(2,9);
        label.htmlFor = field.id;
        // ensure aria
        if (!field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby')) {
          // label provides accessible name via htmlFor
        }
      }
    });
  }
  connectLabels();
  new MutationObserver(()=>connectLabels()).observe(document.documentElement,{childList:true,subtree:true});

  // 2. SEO canonical fallback (if app.js not loaded)
  const seoRoutes = {
    '/': 'DBDEVSTUDIO — strony, aplikacje i marketing digital',
    '/studio': 'Studio — DBDEVSTUDIO',
    '/uslugi': 'Usługi cyfrowe — DBDEVSTUDIO',
    '/uslugi/www': 'Strony WWW — DBDEVSTUDIO',
    '/uslugi/aplikacje': 'Aplikacje — DBDEVSTUDIO',
    '/uslugi/design': 'Design — DBDEVSTUDIO',
    '/uslugi/marketing': 'Marketing — DBDEVSTUDIO',
    '/realizacje': 'Portfolio — DBDEVSTUDIO',
    '/cennik': 'Cennik netto i brutto — DBDEVSTUDIO',
    '/wiedza': 'Wiedza — DBDEVSTUDIO',
    '/wiedza/slownik': 'Słownik — DBDEVSTUDIO',
    '/faq': 'FAQ — DBDEVSTUDIO',
    '/kontakt': 'Kontakt i bezpłatna wycena — DBDEVSTUDIO',
    '/strefa-klienta': 'Strefa klienta — DBDEVSTUDIO',
  };
  function updateSEO(){
    const path = (location.pathname.replace(/\/+$/,'')||'/');
    const url = 'https://dbdevstudio.pl' + (path==='/'?'/':path+'/');
    if (seoRoutes[path]) document.title = seoRoutes[path];
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
    const pl = document.querySelector('link[hreflang="pl"]');
    if (pl) pl.setAttribute('href', url);
    const en = document.querySelector('link[hreflang="en"]');
    if (en) en.setAttribute('href', url+'?lang=en');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', url);
  }
  addEventListener('popstate', updateSEO);
  document.addEventListener('click', e=>{ if(e.target.closest('a[href^="/"]')) setTimeout(updateSEO, 30); });
  updateSEO();

  // 3. External links security
  document.addEventListener('click', e=>{
    const a = e.target.closest('a[href^="http"]');
    if (a && !a.href.includes(location.hostname)) {
      a.setAttribute('target','_blank');
      a.setAttribute('rel','noopener noreferrer');
    }
  });

  // 4. Prefetch on hover for internal links (performance)
  const prefetched = new Set();
  function prefetch(href){
    if (prefetched.has(href)) return;
    prefetched.add(href);
    const link = document.createElement('link');
    link.rel='prefetch';
    link.href=href;
    document.head.appendChild(link);
  }
  document.addEventListener('mouseover', e=>{
    const a = e.target.closest('a[href^="/"]');
    if (a) prefetch(a.href);
  }, {passive:true});

  // 5. Image lazy + decoding async
  function enhanceImages(root=document){
    root.querySelectorAll('img').forEach(img=>{
      if (!img.hasAttribute('loading')) img.loading='lazy';
      if (!img.hasAttribute('decoding')) img.decoding='async';
      if (!img.alt) img.alt='';
    });
  }
  enhanceImages();
  new MutationObserver(()=>enhanceImages()).observe(document.documentElement,{childList:true,subtree:true});

  // 6. Focus visible polyfill helper - already via CSS, but add class for keyboard
  let hadKeyboard = false;
  document.addEventListener('keydown', e=>{
    if (e.key==='Tab') { hadKeyboard=true; document.documentElement.classList.add('keyboard-nav'); }
  });
  document.addEventListener('mousedown', ()=>{ hadKeyboard=false; document.documentElement.classList.remove('keyboard-nav'); });

  // 7. Analytics only if consented
  function shouldLoadAnalytics(){
    try {
      const cats = JSON.parse(localStorage.getItem('cookieCategories')||'{}');
      const consent = localStorage.getItem('dbdev-cookies-consent') || localStorage.getItem('cookieConsent');
      return consent==='all' || cats.analytics===true;
    } catch { return false; }
  }
  // Placeholder for future analytics loading
  if (shouldLoadAnalytics()) {
    console.debug('Analytics consent granted - would load GA/Plausible here');
  }

  // 8. Report web vitals if available
  if ('PerformanceObserver' in window) {
    try {
      const po = new PerformanceObserver(list=>{
        list.getEntries().forEach(entry=>{
          if (entry.entryType==='largest-contentful-paint') {
            console.debug('LCP', Math.round(entry.startTime));
          }
        });
      });
      po.observe({type:'largest-contentful-paint', buffered:true});
    } catch {}
  }

  // 9. Footer year auto update
  const yearSpans = document.querySelectorAll('[data-year]');
  yearSpans.forEach(el=>el.textContent=new Date().getFullYear());

  console.log('DBDEVSTUDIO enhancements v2026.07.17 loaded');
})();
