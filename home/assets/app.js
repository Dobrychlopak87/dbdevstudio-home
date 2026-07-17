/**
 * DBDEVSTUDIO - Production SPA
 * Version: 2026-07-17.1
 * Vanilla JS, no external dependencies, SEO-friendly, accessible
 * Supports history routing + hash fallback
 */
(() => {
  'use strict';

  const VERSION = '2026.07.17-1';
  const LS_LANG = 'dbdev-lang';
  const LS_THEME = 'dbdev-theme';
  const LS_COOKIE = 'dbdev-cookies-consent';
  const LS_COOKIE_CATS = 'cookieCategories';

  // ---- i18n ----
  const i18nData = {
    pl: {
      nav: { studio: 'Studio', uslugi: 'Usługi', realizacje: 'Realizacje', cennik: 'Cennik', wiedza: 'Wiedza', faq: 'FAQ', kontakt: 'Kontakt', strefa: 'Strefa Klienta' },
      cta: 'Bezpłatna wycena',
      heroTitle: 'Strony, które pracują za Ciebie.',
      heroLead: 'Projektujemy strony, aplikacje i kampanie, które sprzedają. Z Krośna Odrzańskiego — dla firm z całej Polski.',
      services: 'Co robimy',
      portfolio: 'Projekty, które działają',
      pricing: 'Trzy pakiety, zero ukrytych kosztów',
      faq: 'Masz pytania?',
      start: 'Zaczynamy?',
      footerDesc: 'Projektujemy skuteczne strony WWW, aplikacje i kampanie dla firm z całej Polski. RODO, PWA, SEO.',
    },
    en: {
      nav: { studio: 'Studio', uslugi: 'Services', realizacje: 'Portfolio', cennik: 'Pricing', wiedza: 'Knowledge', faq: 'FAQ', kontakt: 'Contact', strefa: 'Client Zone' },
      cta: 'Free quote',
      heroTitle: 'Websites that work for you.',
      heroLead: 'We design websites, apps and campaigns that sell. From Krosno Odrzańskie — for companies across Poland.',
      services: 'What we do',
      portfolio: 'Projects that work',
      pricing: 'Three packages, zero hidden costs',
      faq: 'Questions?',
      start: 'Shall we start?',
      footerDesc: 'We design effective websites, apps and campaigns for companies across Poland. GDPR, PWA, SEO.',
    }
  };

  function getLang() {
    const url = new URL(location.href);
    const param = url.searchParams.get('lang');
    if (param && i18nData[param]) return param;
    const stored = localStorage.getItem(LS_LANG);
    if (stored && i18nData[stored]) return stored;
    return document.documentElement.lang?.startsWith('en') ? 'en' : 'pl';
  }
  let lang = getLang();
  const t = (key) => {
    const parts = key.split('.');
    let cur = i18nData[lang];
    for (const p of parts) { if (cur && p in cur) cur = cur[p]; else return key; }
    return cur;
  };

  // ---- Data ----
  const services = [
    { slug: 'www', title: 'Strony WWW', desc: 'Firmowe, landing, sklepy, rezerwacje', icon: '🌐' },
    { slug: 'aplikacje', title: 'Aplikacje', desc: 'iOS, Android, PWA, integracje', icon: '📱' },
    { slug: 'marketing', title: 'Marketing', desc: 'SEO, kampanie, newsletter, social', icon: '📈' },
    { slug: 'design', title: 'Design', desc: 'Branding, identyfikacja, grafiki', icon: '🎨' },
  ];

  const portfolio = [
    { slug: 'kurier-ai', title: 'KURIER AI', tag: 'AI', desc: 'Planowanie i optymalizacja pracy kurierów z AI.', img: '/images/portfolio/kurier-ai.webp', live: false },
    { slug: 'tiktok-reel-studio-pro', title: 'TikTok Reel Studio Pro', tag: 'Video', desc: 'Narzędzie do kreacji i publikacji wideo.', img: '/images/portfolio/tiktok-reel-studio-pro.webp', live: true },
    { slug: 'nano4hr', title: 'nano4HR', tag: 'HR/SaaS', desc: 'System ewidencji czasu pracy.', img: '/images/portfolio/nano4hr.webp', live: true },
  ];

  const knowledge = [
    { slug: 'restauracja-menu-online-zamowienia', title: 'Restauracja – menu online i zamówienia', desc: 'Jak zwiększyć sprzedaż dzięki menu online.' },
    { slug: 'sklep-osiedlowy-vs-sieciowka', title: 'Sklep osiedlowy vs sieciówka', desc: 'Przewagi lokalnego biznesu w internecie.' },
    { slug: 'skrzynka-firmowa-podpis-i-marketing', title: 'Skrzynka firmowa, podpis i marketing', desc: 'Profesjonalny e-mail firmowy i jego rola.' },
    { slug: 'slownik', title: 'Słownik pojęć', desc: 'Wyjaśniamy pojęcia: RODO, PWA, SEO...' },
    { slug: 'strona-www-dla-salonu-fryzjerskiego', title: 'Strona WWW dla salonu fryzjerskiego', desc: 'Rezerwacje online i portfolio fryzur.' },
    { slug: 'warsztat-samochodowy-strona-www', title: 'Warsztat samochodowy – strona WWW', desc: 'Jak warsztat zyskuje dzięki stronie.' },
    { slug: 'wlasna-domena-i-email-firmowy', title: 'Własna domena i e-mail firmowy', desc: 'Dlaczego warto mieć własną domenę.' },
  ];

  const pricing = [
    { tier: 'TIER 1', price: 'od 2 500 zł netto', brutto: '3 075 zł brutto', time: '3–4 tyg.', features: ['Branding', 'Copywriting', 'Terminarz online', 'SEO', 'PWA'], popular: false },
    { tier: 'TIER 2', price: 'od 4 000 zł netto', brutto: '4 920 zł brutto', time: '4–6 tyg.', features: ['AI agent', '6 grafik custom', 'Tryb ciemny', 'PL / EN', 'Analytics'], popular: true },
    { tier: 'TIER 3', price: 'od 8 000 zł netto', brutto: '9 840 zł brutto', time: '6+ tyg.', features: ['Komunikacja', 'Opinie / rating', 'Mega menu', 'Newsletter', 'SMS'], popular: false },
  ];

  // ---- Router ----
  const routes = {
    '/': { title: 'DBDEVSTUDIO — strony, aplikacje i marketing digital', desc: 'Projektujemy skuteczne strony WWW, aplikacje i kampanie dla firm z całej Polski.', render: renderHome },
    '/studio': { title: 'Studio — DBDEVSTUDIO', desc: 'Poznaj studio DBDEVSTUDIO z Krosna Odrzańskiego.', render: renderStudio },
    '/uslugi': { title: 'Usługi cyfrowe — DBDEVSTUDIO', desc: 'Strony WWW, aplikacje, marketing i design.', render: renderUslugi },
    '/uslugi/www': { title: 'Strony WWW — DBDEVSTUDIO', desc: 'Profesjonalne strony WWW firmowe, landing, sklepy.', render: () => renderServiceDetail('www') },
    '/uslugi/aplikacje': { title: 'Aplikacje — DBDEVSTUDIO', desc: 'Aplikacje iOS, Android, PWA, cross-platform.', render: () => renderServiceDetail('aplikacje') },
    '/uslugi/design': { title: 'Projektowanie — DBDEVSTUDIO', desc: 'Branding, identyfikacja wizualna, grafiki.', render: () => renderServiceDetail('design') },
    '/uslugi/marketing': { title: 'Marketing — DBDEVSTUDIO', desc: 'SEO, kampanie, newsletter, social media.', render: () => renderServiceDetail('marketing') },
    '/realizacje': { title: 'Portfolio — DBDEVSTUDIO', desc: 'Zobacz nasze realizacje - strony WWW, aplikacje.', render: renderRealizacje },
    '/cennik': { title: 'Cennik netto i brutto — DBDEVSTUDIO', desc: 'Cennik usług DBDEVSTUDIO - przejrzyste ceny.', render: renderCennik },
    '/wiedza': { title: 'Wiedza — DBDEVSTUDIO', desc: 'Baza wiedzy o stronach WWW, aplikacjach i marketingu.', render: renderWiedza },
    '/wiedza/slownik': { title: 'Słownik pojęć — DBDEVSTUDIO', desc: 'Słownik pojęć: RODO, PWA, SEO, CTA i więcej.', render: () => renderArticle('slownik') },
    '/faq': { title: 'FAQ — DBDEVSTUDIO', desc: 'Najczęściej zadawane pytania o DBDEVSTUDIO.', render: renderFaq },
    '/kontakt': { title: 'Kontakt i bezpłatna wycena — DBDEVSTUDIO', desc: 'Skontaktuj się z DBDEVSTUDIO - bezpłatna wycena 24h.', render: renderKontakt },
    '/strefa-klienta': { title: 'Strefa klienta — DBDEVSTUDIO', desc: 'Strefa klienta DBDEVSTUDIO - logowanie.', render: renderStrefaKlienta },
    '/reset-hasla': { title: 'Reset hasła — DBDEVSTUDIO', desc: 'Zresetuj hasło do strefy klienta.', render: renderResetHasla },
    '/polityka-prywatnosci': { title: 'Polityka prywatności — DBDEVSTUDIO', desc: 'Polityka prywatności DBDEVSTUDIO.', render: () => renderStatic('Polityka prywatności', '<p>Szanujemy Twoją prywatność. Dane przetwarzane zgodnie z RODO. Administrator: DBDEVSTUDIO, Krosno Odrzańskie, kontakt@dbdevstudio.pl. Szczegóły w pełnej wersji dokumentu.</p><p>Pliki cookies używane do działania serwisu i analityki po zgodzie. Masz prawo dostępu, sprostowania, usunięcia, ograniczenia, przenoszenia i sprzeciwu.</p>') },
    '/rodo': { title: 'RODO — DBDEVSTUDIO', desc: 'Informacja RODO.', render: () => renderStatic('RODO', '<p>Spełniamy wymogi RODO. Zgodność RODO to standard naszych realizacji. Dane przetwarzane minimalnie, bezpiecznie, z szyfrowaniem. Szczegóły na żądanie: kontakt@dbdevstudio.pl</p>') },
    '/regulamin': { title: 'Regulamin — DBDEVSTUDIO', desc: 'Regulamin świadczenia usług DBDEVSTUDIO.', render: () => renderStatic('Regulamin', '<p>Regulamin określa zasady współpracy, realizacji projektów WWW, aplikacji i marketingu. Realizacje zgodnie z ustaleniami, terminy, płatności, prawa autorskie. Kontakt: kontakt@dbdevstudio.pl</p>') },
    '/regulamin-promocji': { title: 'Regulamin promocji — DBDEVSTUDIO', desc: 'Regulamin promocji DBDEVSTUDIO.', render: () => renderStatic('Regulamin promocji', '<p>Promocje okresowe, zasady rabatów i pakietów. Szczegóły promocji w aktualnych ofertach.</p>') },
    '/cookies': { title: 'Polityka cookies — DBDEVSTUDIO', desc: 'Polityka plików cookies DBDEVSTUDIO.', render: () => renderStatic('Polityka cookies', '<p>Używamy cookies niezbędnych (sesja, bezpieczeństwo) oraz opcjonalnych analitycznych i marketingowych za zgodą. Zarządzaj zgodą w banerze cookies. Szczegóły: do czego, jak długo, jak wycofać zgodę.</p>') },
    '/dostepnosc': { title: 'Deklaracja dostępności — DBDEVSTUDIO', desc: 'Deklaracja dostępności cyfrowej DBDEVSTUDIO.', render: () => renderStatic('Deklaracja dostępności', '<p>Dążymy do WCAG 2.1 AA: kontrast, nawigacja klawiaturą, skip link, etykiety, alt. Jeśli masz problem, napisz: kontakt@dbdevstudio.pl, +48 667 856 822.</p>') },
  };

  // dynamic routes
  function matchRoute(path) {
    const clean = path.replace(/\/+$/,'') || '/';
    if (routes[clean]) return { route: routes[clean], params: {}, path: clean };
    // /realizacje/:slug
    if (clean.startsWith('/realizacje/')) {
      const slug = clean.split('/')[2];
      const found = portfolio.find(p=>p.slug===slug);
      if (found) return { route: { title: `${found.title} — DBDEVSTUDIO`, desc: found.desc, render: () => renderPortfolioDetail(found) }, params:{slug}, path: clean };
    }
    // /wiedza/:slug
    if (clean.startsWith('/wiedza/')) {
      const slug = clean.split('/')[2];
      const found = knowledge.find(k=>k.slug===slug);
      if (found) return { route: { title: `${found.title} — DBDEVSTUDIO`, desc: found.desc, render: () => renderArticle(slug) }, params:{slug}, path: clean };
    }
    // /uslugi/:slug fallback already covered but generic
    if (clean.startsWith('/uslugi/')) {
      const slug = clean.split('/')[2];
      if (services.find(s=>s.slug===slug)) return { route: { title: `${slug} — DBDEVSTUDIO`, desc: 'Usługa', render: () => renderServiceDetail(slug)}, params:{slug}, path: clean };
    }
    return null;
  }

  function getCurrentPath() {
    // support hash mode: #/path
    if (location.hash && location.hash.startsWith('#/')) {
      return '/' + location.hash.slice(2).split('?')[0].split('#')[0];
    }
    let p = location.pathname;
    // remove base? we have <base href="/"> so pathname is from root
    p = p.replace(/\/+/g,'/').replace(/\/$/,'') || '/';
    return p;
  }

  function navigate(to, replace=false) {
    const url = new URL(to, location.origin);
    const path = url.pathname.replace(/\/+$/,'') || '/';
    // preserve query lang
    if (lang === 'en' && !url.searchParams.has('lang')) url.searchParams.set('lang','en');
    // if history supported and not hash
    if (history.pushState) {
      if (replace) history.replaceState(null,'',url.pathname + url.search + url.hash);
      else history.pushState(null,'',url.pathname + url.search + url.hash);
      handleRoute();
    } else {
      location.hash = '#' + path;
    }
    window.scrollTo(0,0);
  }

  function handleRoute() {
    const path = getCurrentPath();
    const matched = matchRoute(path);
    const root = document.getElementById('root');
    if (!root) return;
    if (!matched) { render404(path); updateSEO({ title: '404 — DBDEVSTUDIO', desc: 'Strona nie znaleziona.', path }); return; }
    const { route } = matched;
    root.innerHTML = route.render();
    updateSEO({ title: route.title, desc: route.desc, path: matched.path });
    afterRender(matched.path);
    // close mobile nav
    document.querySelector('.nav')?.classList.remove('open');
    // accessibility: focus main
    const main = document.getElementById('main-content');
    if (main) { main.setAttribute('tabindex','-1'); main.focus({preventScroll:true}); }
  }

  function updateSEO({ title, desc, path }) {
    document.title = title;
    const canonicalPath = path === '/' ? '/' : path + '/';
    const canonicalUrl = 'https://dbdevstudio.pl' + canonicalPath;
    const setMeta = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('link[rel="canonical"]','href',canonicalUrl);
    setMeta('link[hreflang="pl"]','href',canonicalUrl);
    setMeta('link[hreflang="en"]','href',canonicalUrl + '?lang=en');
    setMeta('meta[property="og:url"]','content',canonicalUrl);
    setMeta('meta[property="og:title"]','content',title);
    const mDesc = document.querySelector('meta[name="description"]');
    if (mDesc) mDesc.setAttribute('content', desc);
    setMeta('meta[property="og:description"]','content',desc);
    // breadcrumbs json-ld
    const bcMap = {
      '/': [{name:'Strona główna', url:'https://dbdevstudio.pl/'}],
      '/studio': [{name:'Strona główna', url:'https://dbdevstudio.pl/'},{name:'Studio', url:'https://dbdevstudio.pl/studio/'}],
      '/uslugi': [{name:'Strona główna', url:'/'},{name:'Usługi', url:'/uslugi/'}],
      '/realizacje': [{name:'Strona główna', url:'/'},{name:'Portfolio', url:'/realizacje/'}],
      '/cennik': [{name:'Strona główna', url:'/'},{name:'Cennik', url:'/cennik/'}],
      '/wiedza': [{name:'Strona główna', url:'/'},{name:'Wiedza', url:'/wiedza/'}],
      '/faq': [{name:'Strona główna', url:'/'},{name:'FAQ', url:'/faq/'}],
      '/kontakt': [{name:'Strona główna', url:'/'},{name:'Kontakt', url:'/kontakt/'}],
    };
    const items = bcMap[path] || [{name:'Strona główna', url:'/'},{name:title.split('—')[0].trim(), url: canonicalPath}];
    const ld = {
      "@context":"https://schema.org",
      "@type":"BreadcrumbList",
      "itemListElement": items.map((it,i)=>({"@type":"ListItem","position":i+1,"name":it.name,"item": 'https://dbdevstudio.pl' + (it.url.startsWith('/')?it.url:'/'+it.url)}))
    };
    let script = document.querySelector('script[type="application/ld+json"][data-bc]');
    if (!script) { script = document.createElement('script'); script.type='application/ld+json'; script.setAttribute('data-bc',''); document.head.appendChild(script); }
    script.textContent = JSON.stringify(ld);
  }

  // ---- Layout helpers ----
  function headerHTML() {
    const path = getCurrentPath();
    const isActive = (p) => path===p || path.startsWith(p+'/') ? 'active' : '';
    return `
    <header class="header" role="banner">
      <div class="container-main header-inner">
        <a href="/" class="logo" aria-label="DBDEVSTUDIO home" data-nav><span class="accent">DB</span>DEVSTUDIO</a>
        <button class="mobile-toggle" aria-expanded="false" aria-controls="main-nav" id="mobile-toggle">Menu</button>
        <nav aria-label="Główna">
          <ul class="nav" id="main-nav">
            <li><a href="/studio" data-nav class="${isActive('/studio')}">${t('nav.studio')}</a></li>
            <li><a href="/uslugi" data-nav class="${isActive('/uslugi')}">${t('nav.uslugi')}</a></li>
            <li><a href="/realizacje" data-nav class="${isActive('/realizacje')}">${t('nav.realizacje')}</a></li>
            <li><a href="/cennik" data-nav class="${isActive('/cennik')}">${t('nav.cennik')}</a></li>
            <li><a href="/wiedza" data-nav class="${isActive('/wiedza')}">${t('nav.wiedza')}</a></li>
            <li><a href="/faq" data-nav class="${isActive('/faq')}">${t('nav.faq')}</a></li>
            <li><a href="/kontakt" data-nav class="cta">${t('cta')}</a></li>
            <li><a href="/strefa-klienta" data-nav class="${isActive('/strefa-klienta')}">${t('nav.strefa')}</a></li>
          </ul>
        </nav>
      </div>
    </header>`;
  }

  function footerHTML() {
    return `
    <footer class="footer" role="contentinfo">
      <div class="container-main">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="/" class="logo" data-nav><span class="accent">DB</span>DEVSTUDIO</a>
            <p>${t('footerDesc')}</p>
            <p style="margin-top:1rem"><a href="tel:+48667856822">+48 667 856 822</a><br><a href="mailto:kontakt@dbdevstudio.pl">kontakt@dbdevstudio.pl</a><br>Krosno Odrzańskie</p>
          </div>
          <div><h4>Usługi</h4><ul>${services.map(s=>`<li><a href="/uslugi/${s.slug}" data-nav>${s.title}</a></li>`).join('')}</ul></div>
          <div><h4>Firma</h4><ul><li><a href="/studio" data-nav>Studio</a></li><li><a href="/realizacje" data-nav>Realizacje</a></li><li><a href="/cennik" data-nav>Cennik</a></li><li><a href="/wiedza" data-nav>Wiedza</a></li><li><a href="/faq" data-nav>FAQ</a></li></ul></div>
          <div><h4>Prawo</h4><ul><li><a href="/polityka-prywatnosci" data-nav>Polityka prywatności</a></li><li><a href="/rodo" data-nav>RODO</a></li><li><a href="/regulamin" data-nav>Regulamin</a></li><li><a href="/cookies" data-nav>Cookies</a></li><li><a href="/dostepnosc" data-nav>Dostępność</a></li></ul></div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} DBDEVSTUDIO. Wszelkie prawa zastrzeżone. v${VERSION}</span>
          <span><a href="#" id="cookie-settings-link">Ustawienia cookies</a> · <a href="#" id="theme-toggle">🌓 Motyw</a> · <a href="#" id="lang-toggle">🌐 ${lang.toUpperCase()}</a></span>
        </div>
      </div>
    </footer>
    <div class="cookie-banner" id="cookie-banner" role="dialog" aria-labelledby="cookie-title">
      <h4 id="cookie-title">Szanujemy Twoją prywatność</h4>
      <p>Używamy ciasteczek niezbędnych oraz opcjonalnych analitycznych i marketingowych. Zarządzaj zgodą.</p>
      <div class="cookie-actions">
        <button class="btn btn-primary btn-sm" id="cookie-accept-all">Akceptuj wszystkie</button>
        <button class="btn btn-secondary btn-sm" id="cookie-reject">Odrzuć opcjonalne</button>
        <button class="btn btn-ghost btn-sm" id="cookie-settings">Ustawienia</button>
      </div>
    </div>`;
  }

  function wrap(content, opts={}) {
    const bc = opts.breadcrumbs || `<nav class="breadcrumbs" aria-label="Okruszki"><a href="/" data-nav>Strona główna</a></nav>`;
    return `
    ${headerHTML()}
    <main id="main-content" class="animate-fade-in" tabindex="-1">
      <div class="container-main" style="padding-top:1.5rem">${bc}</div>
      ${content}
    </main>
    ${footerHTML()}
    `;
  }

  // ---- Renderers ----
  function renderHome() {
    return wrap(`
      <section class="hero">
        <div class="container-main hero-grid">
          <div>
            <span class="badge">Software for Business</span>
            <h1>${t('heroTitle').split(' ').slice(0,2).join(' ')} <span class="gradient">${t('heroTitle').split(' ').slice(2).join(' ')}</span></h1>
            <p class="lead">${t('heroLead')}</p>
            <div class="hero-actions">
              <a href="/kontakt" data-nav class="btn btn-primary">Bezpłatna wycena</a>
              <a href="#co-robimy" class="btn btn-secondary">Co robimy</a>
            </div>
            <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem;color:var(--color-text-muted);font-size:.85rem">
              <span>✓ RODO</span><span>✓ PWA</span><span>✓ SEO</span><span>✓ 24/7 opieka</span>
            </div>
          </div>
          <div class="hero-images">
            <img src="/images/hero/hero-www.webp" alt="Strony WWW" loading="eager" width="600" height="400">
            <img src="/images/hero/hero-apps.webp" alt="Aplikacje" loading="lazy" width="600" height="400">
            <img src="/images/hero/hero-design.webp" alt="Design" loading="lazy" width="600" height="400">
            <img src="/images/hero/hero-seo.webp" alt="SEO" loading="lazy" width="600" height="400">
          </div>
        </div>
      </section>

      <div class="marquee" style="padding:1rem 0;border-top:1px solid var(--color-border);border-bottom:1px solid var(--color-border)">
        <div class="marquee-content" style="gap:2rem;color:var(--color-text-muted);font-weight:600;letter-spacing:.1em">
          <span>WWW</span><span>•</span><span>iOS</span><span>•</span><span>Android</span><span>•</span><span>SEO</span><span>•</span><span>RODO</span><span>•</span><span>Branding</span><span>•</span><span>Newsletter</span><span>•</span><span>AI</span><span>•</span><span>PWA</span><span>•</span><span>E-commerce</span><span>•</span>
          <span>WWW</span><span>•</span><span>iOS</span><span>•</span><span>Android</span><span>•</span><span>SEO</span><span>•</span><span>RODO</span><span>•</span><span>Branding</span><span>•</span><span>Newsletter</span><span>•</span><span>AI</span><span>•</span><span>PWA</span><span>•</span><span>E-commerce</span><span>•</span>
        </div>
      </div>

      <section class="section" id="co-robimy">
        <div class="container-main">
          <div class="section-header"><h2>${t('services')}</h2><p>Kliknij to co najlepiej opisuje Twoją potrzebę.</p></div>
          <div class="grid grid-4">
            ${services.map(s=>`
              <a href="/uslugi/${s.slug}" data-nav class="card" style="text-decoration:none;color:inherit">
                <div style="font-size:2rem;margin-bottom:.75rem">${s.icon}</div>
                <h3>${s.title}</h3><p>${s.desc}</p><span class="text-gradient" style="font-weight:600;margin-top:.5rem;display:inline-block">Szczegóły →</span>
              </a>`).join('')}
          </div>
        </div>
      </section>

      <section class="section" style="background:var(--color-bg-light)">
        <div class="container-main">
          <div class="section-header"><h2>${t('portfolio')}</h2><p>Projekty, które działają. Dwa z nich są dostępne na żywo.</p></div>
          <div class="grid grid-3">${portfolio.map(p=>`
            <a href="/realizacje/${p.slug}" data-nav class="portfolio-card" style="text-decoration:none;color:inherit">
              <img src="${p.img}" alt="${p.title}" loading="lazy" width="600" height="375">
              <div class="portfolio-card-content"><span class="tag">${p.tag}</span><h3>${p.title}</h3><p style="color:var(--color-text-muted);font-size:.9rem">${p.desc}</p></div>
            </a>`).join('')}</div>
          <div class="text-center" style="margin-top:2rem"><a href="/realizacje" data-nav class="btn btn-secondary">Wszystkie realizacje</a></div>
        </div>
      </section>

      <section class="section">
        <div class="container-main">
          <div class="section-header"><h2>${t('pricing')}</h2><p>Wybierz co pasuje — lub zamów wycenę indywidualną.</p></div>
          <div class="grid grid-3">${pricing.map(pl=>`
            <div class="pricing-card ${pl.popular?'featured':''}">
              <h3>${pl.tier}</h3><div class="price">${pl.price}<br><small>${pl.brutto} · ${pl.time}</small></div>
              <ul>${pl.features.map(f=>`<li>${f}</li>`).join('')}</ul>
              <a href="/kontakt" data-nav class="btn ${pl.popular?'btn-primary':'btn-secondary'}" style="width:100%">Wybieram</a>
            </div>`).join('')}</div>
          <div class="text-center" style="margin-top:2rem"><a href="/cennik" data-nav class="btn btn-ghost">Pełny cennik →</a></div>
        </div>
      </section>

      <section class="section" style="background:var(--color-bg-light)">
        <div class="container-main">
          <div class="section-header"><h2>${t('faq')}</h2></div>
          <div class="grid grid-2" style="max-width:900px;margin:0 auto">
            ${[
              ['Ile trwa budowa strony?','Od kilku dni (landing) do 6+ tygodni. Średnio 2–4 tygodnie na stronę firmową.'],
              ['Czy strony są responsywne?','Tak — responsywność to standard. Telefony, tablety, komputery.'],
              ['Czy można dodać rezerwacje?','Tak. Integrujemy terminarze i formularze rezerwacyjne.'],
              ['Czy jest opieka po publikacji?','Tak — pakiety Basic, Pro i Enterprise. Domena, e-mail, aktualizacje.'],
            ].map(([q,a])=>`<div class="card"><h3 style="font-size:1rem">${q}</h3><p style="margin-top:.5rem">${a}</p></div>`).join('')}
          </div>
          <div class="text-center" style="margin-top:2rem"><a href="/faq" data-nav class="btn btn-secondary">Pełne FAQ</a></div>
        </div>
      </section>

      <section class="section" style="text-align:center">
        <div class="container-main"><h2>${t('start')}</h2><p style="color:var(--color-text-muted);margin:1rem 0 2rem">Bezpłatna wycena w 24 godziny.</p><a href="/kontakt" data-nav class="btn btn-primary">Bezpłatna wycena</a></div>
      </section>
    `, { breadcrumbs: '' });
  }

  function renderStudio() {
    return wrap(`
      <section class="section"><div class="container-main">
        <h1>Studio z Krosna Odrzańskiego</h1>
        <p style="color:var(--color-text-muted);max-width:60ch;margin:1rem 0 2rem;line-height:1.7">Jesteśmy zespołem projektantów, developerów i marketerów. Działamy zdalnie dla klientów z całej Polski, z bazą w Krosnie Odrzańskim. Specjalizujemy się w WWW, PWA, RODO, SEO, AI.</p>
        <div class="grid grid-3">
          <div class="card"><h3>🎯 Misja</h3><p>Strony, które sprzedają — nie tylko ładnie wyglądają.</p></div>
          <div class="card"><h3>⚡ Szybkość</h3><p>2–4 tygodnie średnio do publikacji strony firmowej.</p></div>
          <div class="card"><h3>🤝 Opieka</h3><p>Monitoring, aktualizacje, domena, e-mail w pakietach opieki.</p></div>
        </div>
        <h2 style="margin-top:3rem">Stack</h2>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem">
          ${['React 19','PWA','Vite','Tailwind','SQLite','PHP','SEO','RODO','WCAG','AI'].map(t=>`<span style="background:var(--color-bg-card);border:1px solid var(--color-border);padding:.35rem .75rem;border-radius:99px;font-size:.85rem">${t}</span>`).join('')}
        </div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <span aria-current="page">Studio</span></nav>` });
  }

  function renderUslugi() {
    return wrap(`
      <section class="section"><div class="container-main">
        <h1>Usługi cyfrowe</h1><p style="color:var(--color-text-muted);margin:1rem 0 2rem">Kompleksowo: od pomysłu po utrzymanie.</p>
        <div class="grid grid-2">
          ${services.map(s=>`
            <a href="/uslugi/${s.slug}" data-nav class="card" style="text-decoration:none;color:inherit">
              <div style="display:flex;gap:1rem;align-items:center"><div style="font-size:2.5rem">${s.icon}</div><div><h3>${s.title}</h3><p>${s.desc}</p></div></div>
            </a>`).join('')}
        </div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <span aria-current="page">Usługi</span></nav>` });
  }

  function renderServiceDetail(slug) {
    const s = services.find(x=>x.slug===slug) || { title: slug, desc: '', icon: '✨' };
    const details = {
      www: `<ul><li>Strony firmowe, landing, sklepy</li><li>Rezerwacje, terminarze</li><li>SEO + RODO + PWA</li><li>CMS lub headless</li></ul>`,
      aplikacje: `<ul><li>iOS, Android, PWA</li><li>Offline, push, sync</li><li>Integracje API, płatności</li><li>Wydanie w sklepach</li></ul>`,
      design: `<ul><li>Branding, logo, identyfikacja</li><li>Grafiki social, print</li><li>Design system</li><li>Prototypy Figma</li></ul>`,
      marketing: `<ul><li>SEO techniczne i content</li><li>Google Ads, Meta Ads</li><li>Newsletter, automatyzacje</li><li>Analityka</li></ul>`,
    };
    return wrap(`
      <section class="section"><div class="container-main">
        <h1><span style="font-size:2rem">${s.icon}</span> ${s.title}</h1>
        <p style="color:var(--color-text-muted);margin-top:.5rem">${s.desc}</p>
        <div style="margin-top:2rem" class="card">${details[slug]||'<p>Kompleksowa usługa.</p>'}</div>
        <div style="margin-top:2rem"><a href="/kontakt" data-nav class="btn btn-primary">Zamów wycenę ${s.title}</a> <a href="/realizacje" data-nav class="btn btn-secondary">Zobacz realizacje</a></div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <a href="/uslugi" data-nav>Usługi</a> › <span aria-current="page">${s.title}</span></nav>` });
  }

  function renderRealizacje() {
    return wrap(`
      <section class="section"><div class="container-main">
        <h1>Realizacje</h1><p style="color:var(--color-text-muted);margin:1rem 0 2rem">Portfolio projektów, które działają.</p>
        <div class="grid grid-3">${portfolio.map(p=>`
          <a href="/realizacje/${p.slug}" data-nav class="portfolio-card" style="text-decoration:none;color:inherit">
            <img src="${p.img}" alt="${p.title}" loading="lazy"><div class="portfolio-card-content"><span class="tag">${p.tag}</span><h3>${p.title}</h3><p style="color:var(--color-text-muted);font-size:.9rem">${p.desc}</p>${p.live?'<span class="badge" style="margin-top:.5rem">Na żywo</span>':''}</div>
          </a>`).join('')}</div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <span aria-current="page">Realizacje</span></nav>` });
  }

  function renderPortfolioDetail(p) {
    return wrap(`
      <section class="section"><div class="container-main">
        <span class="tag">${p.tag}</span><h1>${p.title}</h1><p style="color:var(--color-text-muted);margin:.5rem 0 2rem">${p.desc}</p>
        <img src="${p.img}" alt="${p.title}" style="width:100%;border-radius:1.5rem;border:1px solid var(--color-border);max-width:900px" loading="eager">
        <div class="card" style="margin-top:2rem;max-width:700px">
          <h3>O projekcie</h3><p style="margin-top:.75rem;line-height:1.7">Projekt ${p.title} to przykład nowoczesnego podejścia: PWA, RODO, SEO, wydajność, dostępność. Zrealizowany dla klienta z myślą o konwersji.</p>
          <ul style="margin-top:1rem"><li>✅ PWA + offline</li><li>✅ RODO i bezpieczeństwo</li><li>✅ SEO techniczne</li><li>✅ Analytics</li></ul>
        </div>
        <div style="margin-top:2rem"><a href="/kontakt" data-nav class="btn btn-primary">Chcę podobny projekt</a></div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <a href="/realizacje" data-nav>Realizacje</a> › <span aria-current="page">${p.title}</span></nav>` });
  }

  function renderCennik() {
    return wrap(`
      <section class="section"><div class="container-main">
        <h1>Cennik</h1><p style="color:var(--color-text-muted);margin:1rem 0 2rem">Przejrzyste ceny bez ukrytych kosztów. Możliwe raty.</p>
        <div class="grid grid-3">${pricing.map(pl=>`
          <div class="pricing-card ${pl.popular?'featured':''}">
            <h3>${pl.tier}</h3><div class="price">${pl.price}<br><small>${pl.brutto} · ${pl.time}</small></div>
            <ul>${pl.features.map(f=>`<li>${f}</li>`).join('')}</ul>
            <a href="/kontakt" data-nav class="btn ${pl.popular?'btn-primary':'btn-secondary'}" style="width:100%">Wybieram</a>
          </div>`).join('')}</div>
        <div class="card" style="margin-top:3rem"><h3>Dodatkowe informacje</h3><p style="margin-top:.5rem;color:var(--color-text-muted)">Ceny netto. Brutto = netto +23% VAT. Płatność: 50% zaliczka, 50% przy publikacji. Raty via PayU / Przelewy24. Umowa, faktura VAT, opieka opcjonalna.</p></div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <span aria-current="page">Cennik</span></nav>` });
  }

  function renderWiedza() {
    return wrap(`
      <section class="section"><div class="container-main">
        <h1>Baza wiedzy</h1><p style="color:var(--color-text-muted);margin:1rem 0 2rem">Poradniki i artykuły dla firm.</p>
        <div class="grid grid-3">${knowledge.map(k=>`<a href="/wiedza/${k.slug}" data-nav class="card" style="text-decoration:none;color:inherit"><h3>${k.title}</h3><p style="margin-top:.5rem">${k.desc}</p></a>`).join('')}</div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <span aria-current="page">Wiedza</span></nav>` });
  }

  function renderArticle(slug) {
    const articles = {
      slownik: `<h2>Słownik pojęć</h2>
        <dl style="display:grid;gap:1rem;margin-top:1rem">
          <div><dt style="font-weight:700">RODO</dt><dd style="color:var(--color-text-muted)">Rozporządzenie o ochronie danych osobowych — standard.</dd></div>
          <div><dt style="font-weight:700">PWA</dt><dd style="color:var(--color-text-muted)">Progressive Web App — strona działająca jak aplikacja, offline.</dd></div>
          <div><dt style="font-weight:700">SEO</dt><dd style="color:var(--color-text-muted)">Optymalizacja pod wyszukiwarki: meta, struktura, szybkość.</dd></div>
          <div><dt style="font-weight:700">CTA</dt><dd style="color:var(--color-text-muted)">Call To Action — przycisk wzywający do działania.</dd></div>
          <div><dt style="font-weight:700">WCAG</dt><dd style="color:var(--color-text-muted)">Wytyczne dostępności: kontrast, klawiatura, czytniki.</dd></div>
        </dl>`,
      'restauracja-menu-online-zamowienia': `<h2>Restauracja – menu online i zamówienia</h2><p>Menu online zwiększa sprzedaż o 20-30%. Integracja z systemem zamówień, płatności online, PWA, QR na stolikach. Przykładowa realizacja: karta dań, zdjęcia, alergeny, godziny, rezerwacje.</p>`,
      'sklep-osiedlowy-vs-sieciowka': `<h2>Sklep osiedlowy vs sieciówka</h2><p>Lokalny sklep wygrywa bliskością i zaufaniem. Strona WWW z nowościami, gazetką, zamówieniami telefonicznymi i odbiorem osobistym buduje lojalność.</p>`,
      'skrzynka-firmowa-podpis-i-marketing': `<h2>Skrzynka firmowa, podpis i marketing</h2><p>E-mail firma@domena.pl buduje zaufanie. Podpis z logo, linkami, NIP i RODO. Newsletter via własna domena = wyższa dostarczalność.</p>`,
      'strona-www-dla-salonu-fryzjerskiego': `<h2>Strona dla salonu fryzjerskiego</h2><p>Portfolio fryzur, cennik, rezerwacje online 24/7, opinie Google, Instagram feed. PWA pozwala klientkom zapisać wizytę w kalendarzu.</p>`,
      'warsztat-samochodowy-strona-www': `<h2>Warsztat – strona WWW</h2><p>Godziny, usługi, cennik orientacyjny, zdjęcia warsztatu, mapa, opinie. Terminarz online zmniejsza telefony o 40%.</p>`,
      'wlasna-domena-i-email-firmowy': `<h2>Własna domena i e-mail</h2><p>Domena to Twoja marka na lata. E-mail firmowy to profesjonalizm i bezpieczeństwo. Konfiguracja SPF, DKIM, DMARC zapobiega spamowi.</p>`,
    };
    const content = articles[slug] || `<p>Artykuł "${slug}" – treść wkrótce. Napisz do nas: kontakt@dbdevstudio.pl</p>`;
    const found = knowledge.find(k=>k.slug===slug);
    return wrap(`
      <section class="section"><div class="container-main" style="max-width:800px">
        <h1>${found?found.title:slug}</h1>
        <div style="margin-top:2rem;line-height:1.8;color:var(--color-text)">${content}</div>
        <div style="margin-top:2rem"><a href="/wiedza" data-nav class="btn btn-secondary">← Wróć do wiedzy</a> <a href="/kontakt" data-nav class="btn btn-primary">Bezpłatna wycena</a></div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <a href="/wiedza" data-nav>Wiedza</a> › <span aria-current="page">${found?found.title:slug}</span></nav>` });
  }

  function renderFaq() {
    const faqs = [
      ['Ile trwa budowa strony?','Od kilku dni (landing) do 6+ tygodni. Średnio 2–4 tygodnie na stronę firmową.'],
      ['Czy strony są responsywne?','Tak — responsywność to standard. Telefony, tablety, komputery.'],
      ['Czy można dodać rezerwacje?','Tak. Integrujemy terminarze i formularze rezerwacyjne.'],
      ['Czy jest opieka po publikacji?','Tak — pakiety Basic, Pro i Enterprise. Domena, e-mail, aktualizacje.'],
      ['Czy pomagacie z treściami?','Tak — copywriting i struktura treści jako dodatkowa usługa.'],
      ['Od jakiej kwoty mogę zacząć?','Od 399 zł za landing page. Dostępne raty.'],
      ['Czy robicie sklepy?','Tak — sklepy, płatności, koszty dostawy, faktury.'],
      ['Czy strona będzie szybka?','Tak — optymalizacja obrazów, lazy load, cache, PWA.'],
    ];
    return wrap(`
      <section class="section"><div class="container-main" style="max-width:800px">
        <h1>FAQ</h1><p style="color:var(--color-text-muted);margin:1rem 0 2rem">Najczęściej zadawane pytania.</p>
        <div style="display:grid;gap:1rem">${faqs.map(([q,a])=>`
          <details class="card" style="cursor:pointer"><summary style="font-weight:600;list-style:none;display:flex;justify-content:space-between"><span>${q}</span><span>↘</span></summary><p style="margin-top:1rem;color:var(--color-text-muted)">${a}</p></details>`).join('')}</div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <span aria-current="page">FAQ</span></nav>` });
  }

  function renderKontakt() {
    return wrap(`
      <section class="section"><div class="container-main" style="max-width:900px">
        <h1>Kontakt</h1><p style="color:var(--color-text-muted);margin:1rem 0">Bezpłatna wycena w 24h. Odpowiadamy szybko.</p>
        <div class="grid grid-2" style="align-items:start">
          <div class="card">
            <h3>Wyślij wiadomość</h3>
            <form id="contact-form" style="margin-top:1rem">
              <div class="form-group"><label for="c-name">Imię i nazwisko</label><input id="c-name" name="name" required placeholder="Jan Kowalski"></div>
              <div class="form-group"><label for="c-email">E-mail</label><input id="c-email" type="email" name="email" required placeholder="jan@firma.pl"></div>
              <div class="form-group"><label for="c-msg">Wiadomość</label><textarea id="c-msg" name="message" required placeholder="Opisz projekt..."></textarea></div>
              <button type="submit" class="btn btn-primary" style="width:100%">Wyślij →</button>
              <div id="contact-message" class="message"></div>
            </form>
          </div>
          <div>
            <div class="card"><h3>Kontakt bezpośredni</h3><p style="margin-top:.75rem"><a href="tel:+48667856822">+48 667 856 822</a><br><a href="mailto:kontakt@dbdevstudio.pl">kontakt@dbdevstudio.pl</a></p><p style="margin-top:.75rem;color:var(--color-text-muted);font-size:.9rem">Krosno Odrzańskie<br>Pn-Pt 09:00–17:00</p></div>
            <div class="card" style="margin-top:1rem"><h3>Dlaczego my?</h3><ul style="margin-top:.75rem;color:var(--color-text-muted);font-size:.9rem;line-height:1.6"><li>✓ Bezpłatna wycena 24h</li><li>✓ Umowa i faktura VAT</li><li>✓ Raty</li><li>✓ Opieka po publikacji</li></ul></div>
          </div>
        </div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <span aria-current="page">Kontakt</span></nav>` });
  }

  function renderStrefaKlienta() {
    return wrap(`
      <section class="section"><div class="container-main" style="max-width:600px">
        <h1>Strefa klienta</h1><p style="color:var(--color-text-muted);margin:1rem 0">Zaloguj się aby zobaczyć swoje projekty i pliki.</p>
        <div class="card" id="login-card">
          <form id="login-form">
            <div class="form-group"><label for="login-email">E-mail</label><input id="login-email" type="email" name="email" required placeholder="you@example.com"></div>
            <div class="form-group"><label for="login-pass">Hasło</label><input id="login-pass" type="password" name="password" required placeholder="••••••••"></div>
            <button type="submit" class="btn btn-primary" style="width:100%">Zaloguj</button>
            <div id="login-message" class="message"></div>
          </form>
          <p style="margin-top:1rem;text-align:center"><a href="/reset-hasla" data-nav>Zapomniałem hasła</a></p>
        </div>
        <div class="card hidden" id="files-card"><h3>Twoje pliki</h3><div id="files-list" style="margin-top:1rem"></div><button id="logout-btn" class="btn btn-secondary" style="margin-top:1rem">Wyloguj</button></div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <span aria-current="page">Strefa klienta</span></nav>` });
  }

  function renderResetHasla() {
    return wrap(`
      <section class="section"><div class="container-main" style="max-width:600px">
        <h1>Reset hasła</h1><p style="color:var(--color-text-muted);margin:1rem 0">Podaj e-mail, wyślemy link do resetu.</p>
        <div class="card">
          <form id="password-reset-form">
            <div class="form-group"><label for="reset-email">E-mail</label><input id="reset-email" type="email" name="email" required placeholder="you@example.com"></div>
            <button type="submit" class="btn btn-primary" style="width:100%">Wyślij link</button>
            <div id="reset-message" class="message"></div>
          </form>
          <p style="margin-top:1rem;text-align:center"><a href="/strefa-klienta" data-nav>Wróć do logowania</a></p>
        </div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <a href="/strefa-klienta" data-nav>Strefa klienta</a> › <span aria-current="page">Reset hasła</span></nav>` });
  }

  function renderStatic(title, html) {
    return wrap(`
      <section class="section"><div class="container-main" style="max-width:800px">
        <h1>${title}</h1><div style="margin-top:2rem;line-height:1.8" class="card">${html}</div>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <span aria-current="page">${title}</span></nav>` });
  }

  function render404(path) {
    const root = document.getElementById('root');
    if (!root) return;
    root.innerHTML = wrap(`
      <section class="section"><div class="container-main" style="text-align:center;max-width:600px">
        <h1>404 — nie znaleziono</h1><p style="color:var(--color-text-muted);margin:1rem 0 2rem">Ścieżka <code>${path}</code> nie istnieje. Sprawdź adres lub wróć na stronę główną.</p>
        <a href="/" data-nav class="btn btn-primary">Strona główna</a> <a href="/kontakt" data-nav class="btn btn-secondary">Kontakt</a>
      </div></section>
    `, { breadcrumbs: `<nav class="breadcrumbs"><a href="/" data-nav>Strona główna</a> › <span aria-current="page">404</span></nav>` });
  }

  // ---- Image display improvements (restored originals, improved method) ----
  function enhanceImagesDisplay(root=document){
    const placeholder = '/images/placeholders/placeholder-800x600.webp';
    root.querySelectorAll('img').forEach(img=>{
      if (img._enhanced) return; img._enhanced=true;
      // Ensure alt, loading, decoding already set via enhancements.js but double-check
      if (!img.hasAttribute('loading')) img.loading='lazy';
      if (!img.hasAttribute('decoding')) img.decoding='async';
      // Prevent CLS: ensure width/height or aspect-ratio
      if (!img.hasAttribute('width')) img.setAttribute('width','600');
      if (!img.hasAttribute('height')) img.setAttribute('height','400');
      // Error fallback to placeholder (preserves layout)
      img.addEventListener('error', ()=>{
        if (img.dataset.fallbackAttempted) return;
        img.dataset.fallbackAttempted='1';
        // Try svg fallback if webp fails (original images may be webp, fallback to svg placeholder)
        const name = img.src.split('/').pop().replace('.webp','.svg');
        // Check if svg placeholder exists (hero, portfolio)
        const svgPath = img.src.replace('.webp','.svg');
        // For hero/portfolio we have svg placeholders now
        if (img.src.includes('/hero/') || img.src.includes('/portfolio/')) {
          img.src = svgPath;
        } else {
          img.src = placeholder;
        }
        img.style.background='var(--color-bg-card)';
        img.style.objectFit='cover';
      }, {once:false});
      // Successful load: add loaded class for fade-in
      img.addEventListener('load', ()=>{ img.classList.add('loaded'); }, {once:true});
    });
  }

  // ---- After render hooks ----
  function afterRender(path) {
    // Improve image display first
    enhanceImagesDisplay();

    // Attach link handler delegation
    document.querySelectorAll('a[data-nav]').forEach(a=>{
      if (a._bound) return; a._bound=true;
      a.addEventListener('click', e=>{
        const href = a.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('#')) return;
        e.preventDefault();
        navigate(href);
      });
    });
    // forms
    if (path === '/kontakt') initContactForm();
    if (path === '/strefa-klienta') initLogin();
    if (path === '/reset-hasla') initPasswordResetLogic();
    // mobile toggle
    const toggle = document.getElementById('mobile-toggle');
    const nav = document.getElementById('main-nav');
    if (toggle && nav && !toggle._bound) {
      toggle._bound=true;
      toggle.addEventListener('click', ()=>{
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    // theme & lang & cookie settings
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn && !themeBtn._bound) { themeBtn._bound=true; themeBtn.addEventListener('click', e=>{ e.preventDefault(); toggleTheme(); }); }
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn && !langBtn._bound) { langBtn._bound=true; langBtn.addEventListener('click', e=>{ e.preventDefault(); toggleLang(); }); }
    const cookieLink = document.getElementById('cookie-settings-link');
    if (cookieLink && !cookieLink._bound) { cookieLink._bound=true; cookieLink.addEventListener('click', e=>{ e.preventDefault(); window.dispatchEvent(new CustomEvent('cookie-settings')); }); }

    // cookie banner logic
    initCookieBanner();

    // PWA install prompt? handled elsewhere
  }

  function initContactForm() {
    const form = document.getElementById('contact-form');
    const msgEl = document.getElementById('contact-message');
    if (!form || form._bound) return; form._bound=true;
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      if (!data.name || !data.email || !data.message) { showMsg(msgEl,'Wypełnij wszystkie pola.','error'); return; }
      try {
        const res = await fetch('/api.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'contact', ...data }) });
        const json = await res.json();
        if (json.success) { showMsg(msgEl,'Wiadomość wysłana! Odpowiemy w 24h.','success'); form.reset(); }
        else showMsg(msgEl, json.message || 'Błąd wysyłki.','error');
      } catch(err){ showMsg(msgEl,'Błąd połączenia. Spróbuj ponownie.','error'); }
    });
  }

  function initLogin() {
    const form = document.getElementById('login-form');
    const msgEl = document.getElementById('login-message');
    const filesCard = document.getElementById('files-card');
    const loginCard = document.getElementById('login-card');
    const filesList = document.getElementById('files-list');
    const logoutBtn = document.getElementById('logout-btn');
    if (!form || form._bound) return; form._bound=true;

    // check existing session
    fetch('/api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'verify-session'})})
      .then(r=>r.json()).then(j=>{
        if (j.success && j.authenticated) { loginCard.classList.add('hidden'); filesCard.classList.remove('hidden'); loadFiles(); }
      }).catch(()=>{});

    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const fd = new FormData(form); const data = Object.fromEntries(fd.entries());
      try {
        const res = await fetch('/api.php',{method:'POST',headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'login', email:data.email, password:data.password})});
        const json = await res.json();
        if (json.success){ showMsg(msgEl,'Zalogowano!','success'); loginCard.classList.add('hidden'); filesCard.classList.remove('hidden'); loadFiles(); }
        else showMsg(msgEl, json.message || 'Błędne dane','error');
      } catch(err){ showMsg(msgEl,'Błąd połączenia','error'); }
    });

    async function loadFiles(){
      if (!filesList) return;
      filesList.innerHTML = '<p class="text-muted">Ładowanie...</p>';
      try{
        const r = await fetch('/api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'get-files'})});
        const j = await r.json();
        if (j.success && j.files) {
          if (j.files.length===0) filesList.innerHTML='<div class="empty-state"><p>Brak plików.</p><p class="text-muted">Skontaktuj się aby otrzymać pliki.</p></div>';
          else filesList.innerHTML = '<table class="table"><thead><tr><th>Nazwa</th><th>Rozmiar</th><th>Data</th></tr></thead><tbody>'+j.files.map(f=>`<tr><td>${escapeHtml(f.name)}</td><td>${formatSize(f.size)}</td><td>${escapeHtml(f.modified)}</td></tr>`).join('')+'</tbody></table>';
        } else filesList.innerHTML='<p class="text-muted">Brak plików lub błąd.</p>';
      }catch{ filesList.innerHTML='<p class="text-muted">Błąd ładowania.</p>'; }
    }

    if (logoutBtn && !logoutBtn._bound){ logoutBtn._bound=true; logoutBtn.addEventListener('click', async ()=>{
      await fetch('/api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});
      location.reload();
    }); }
  }

  function initPasswordResetLogic() {
    const form = document.getElementById('password-reset-form');
    if (!form || form._bound) return; form._bound=true;
    const msgEl = document.getElementById('reset-message');
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const email = form.querySelector('[name="email"]')?.value.trim();
      if (!email){ showMsg(msgEl,'Podaj e-mail','error'); return; }
      try{
        const r = await fetch('/api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'password-reset', email})});
        const j = await r.json();
        if (j.success) { showMsg(msgEl,'Jeśli e-mail istnieje, wysłaliśmy link do resetu.','success'); form.reset(); }
        else showMsg(msgEl, j.message || 'Błąd','error');
      }catch{ showMsg(msgEl,'Błąd połączenia','error'); }
    });
  }

  function showMsg(el, text, type){ if(!el) return; el.textContent=text; el.className='message '+type; el.style.display='block'; }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function formatSize(b){ if(!b) return '0 B'; const u=['B','KB','MB','GB']; let i=0; let sz=Number(b); while(sz>=1024 && i<u.length-1){ sz/=1024; i++; } return sz.toFixed(i?1:0)+' '+u[i]; }

  // cookie banner
  function initCookieBanner(){
    const banner = document.getElementById('cookie-banner');
    if (!banner || banner._bound) return; banner._bound=true;
    const consent = localStorage.getItem(LS_COOKIE);
    if (!consent) banner.classList.add('show');
    const accept = document.getElementById('cookie-accept-all');
    const reject = document.getElementById('cookie-reject');
    const settings = document.getElementById('cookie-settings');
    if (accept) accept.addEventListener('click', ()=>{ localStorage.setItem(LS_COOKIE,'all'); localStorage.setItem(LS_COOKIE_CATS,JSON.stringify({necessary:true,analytics:true,marketing:true})); localStorage.setItem('cookieConsent','all'); localStorage.setItem('dbdev-cookies-consent','all'); banner.classList.remove('show'); location.reload(); });
    if (reject) reject.addEventListener('click', ()=>{ localStorage.setItem(LS_COOKIE,'necessary'); localStorage.setItem(LS_COOKIE_CATS,JSON.stringify({necessary:true,analytics:false,marketing:false})); localStorage.setItem('cookieConsent','necessary'); localStorage.setItem('dbdev-cookies-consent','necessary'); banner.classList.remove('show'); });
    if (settings) settings.addEventListener('click', ()=>{ window.dispatchEvent(new CustomEvent('cookie-settings')); });
  }

  // global cookie settings event
  window.addEventListener('cookie-settings', ()=>{
    const saved = JSON.parse(localStorage.getItem(LS_COOKIE_CATS)||'{}');
    let dialog = document.getElementById('cookie-dialog');
    if (dialog) dialog.remove();
    dialog = document.createElement('dialog');
    dialog.id='cookie-dialog';
    dialog.setAttribute('aria-labelledby','cookie-title');
    dialog.innerHTML = `
      <h2 id="cookie-title">Ustawienia cookies</h2>
      <p style="color:var(--color-text-muted);font-size:.9rem;margin:.5rem 0 1rem">Wybierz opcjonalne kategorie. Niezbędne pliki są zawsze aktywne.</p>
      <p><label><input type="checkbox" checked disabled> Niezbędne — sesja, bezpieczeństwo</label></p>
      <p><label><input id="cookies-analytics" type="checkbox" ${saved.analytics?'checked':''}> Analityczne — statystyki odwiedzin</label></p>
      <p><label><input id="cookies-marketing" type="checkbox" ${saved.marketing?'checked':''}> Marketingowe — personalizacja</label></p>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem">
        <button id="cookies-save" class="btn btn-primary btn-sm">Zapisz wybór</button>
        <button id="cookies-reject" class="btn btn-secondary btn-sm">Odrzuć opcjonalne</button>
        <button id="cookies-close" class="btn btn-ghost btn-sm">Anuluj</button>
      </div>`;
    document.body.append(dialog); dialog.showModal();
    dialog.querySelector('#cookies-save').onclick = ()=>{
      localStorage.setItem(LS_COOKIE_CATS, JSON.stringify({necessary:true,analytics:dialog.querySelector('#cookies-analytics').checked,marketing:dialog.querySelector('#cookies-marketing').checked}));
      localStorage.setItem(LS_COOKIE,'custom'); localStorage.setItem('cookieConsent','custom'); localStorage.setItem('dbdev-cookies-consent','custom'); dialog.close(); location.reload();
    };
    dialog.querySelector('#cookies-reject').onclick = ()=>{ localStorage.setItem(LS_COOKIE_CATS, JSON.stringify({necessary:true,analytics:false,marketing:false})); localStorage.setItem(LS_COOKIE,'necessary'); localStorage.setItem('cookieConsent','necessary'); localStorage.setItem('dbdev-cookies-consent','necessary'); dialog.close(); };
    dialog.querySelector('#cookies-close').onclick = ()=>dialog.close();
    dialog.addEventListener('close',()=>dialog.remove());
  });

  function toggleTheme(){
    const current = localStorage.getItem(LS_THEME) || 'dark';
    const next = current==='dark'?'light':'dark';
    localStorage.setItem(LS_THEME,next);
    applyTheme(next);
  }
  function applyTheme(th){
    if(th==='light'){ document.documentElement.style.setProperty('--color-bg','#f8f8fa'); document.documentElement.style.setProperty('--color-bg-light','#ffffff'); document.documentElement.style.setProperty('--color-bg-card','#ffffff'); document.documentElement.style.setProperty('--color-text','#111113'); document.documentElement.style.setProperty('--color-text-muted','#55556b'); document.documentElement.style.setProperty('--color-border','#e5e5e8'); }
    else{ document.documentElement.style.removeProperty('--color-bg'); document.documentElement.style.removeProperty('--color-bg-light'); document.documentElement.style.removeProperty('--color-bg-card'); document.documentElement.style.removeProperty('--color-text'); document.documentElement.style.removeProperty('--color-text-muted'); document.documentElement.style.removeProperty('--color-border'); }
  }

  function toggleLang(){
    lang = lang==='pl'?'en':'pl';
    localStorage.setItem(LS_LANG, lang);
    const url = new URL(location.href);
    if (lang==='en') url.searchParams.set('lang','en'); else url.searchParams.delete('lang');
    history.replaceState(null,'',url.pathname+url.search+url.hash);
    handleRoute();
  }

  // ---- Init ----
  function init(){
    // apply theme early
    applyTheme(localStorage.getItem(LS_THEME)||'dark');
    // interception
    document.addEventListener('click', e=>{
      const a = e.target.closest('a[href^="/"]');
      if (a && !a.hasAttribute('data-nav') && a.getAttribute('href')?.startsWith('/') && !a.target) {
        e.preventDefault(); navigate(a.getAttribute('href'));
      }
    });
    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', ()=>{ if(location.hash.startsWith('#/')) handleRoute(); });
    handleRoute();
    // register key for a11y: label - input linking
    connectLabels();
    new MutationObserver(()=>connectLabels()).observe(document.documentElement,{childList:true,subtree:true});
  }

  function connectLabels(root=document){
    root.querySelectorAll('label:not([for])').forEach((label)=>{
      const field=label.parentElement?.querySelector('input,select,textarea');
      if(field){ if(!field.id) field.id='field-'+Math.random().toString(36).slice(2,9); label.htmlFor=field.id; }
    });
  }

  // DOM ready
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  console.log(`DBDEVSTUDIO v${VERSION} ready • lang=${lang} • ${new Date().toISOString()}`);
})();
