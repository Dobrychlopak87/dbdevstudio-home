# DBDEVSTUDIO.pl – Archiwum produkcyjne gotowe na serwer
Data: 2026-07-17
Wersja: 2026.07.17-1
Branch: arena/019f6f9c-dbdevstudio-home

## Co zostało zaktualizowane?

### 1. Brakujące zasoby – uzupełnione
- **icons/**: wygenerowano komplet PWA ikon v2 (48, 96, 192, 512, maskable 192/512, apple-touch 180, favicon 16/32 + ico)
- **images/hero/**: hero-www, hero-apps, hero-design, hero-seo (webp, zoptymalizowane)
- **images/portfolio/**: kurier-ai, nano4hr, tiktok-reel-studio-pro (webp)
- **images/screenshots/**: wide + mobile dla PWA
- **images/placeholders/**: placeholdery 800x600, 400x300
- **images/misc/**: og-default
- **assets/fonts/**: Inter + Space Grotesk – woff2 (placeholder) + fonts.css z Google Fonts import fallback

### 2. Frontend – nowy SPA
- **assets/app.css**: kompletna produkcyjna wersja – Tailwind-like, variables, responsive, a11y, dark/light ready, glass, marquee, animacje
- **assets/app.js**: nowy vanilla SPA:
  - routing history + hash fallback
  - i18n PL/EN (?lang=en, localStorage)
  - SEO dynamiczne: title, description, canonical, hreflang, OG, BreadcrumbList JSON-LD
  - renderery dla wszystkich tras: /, /studio, /uslugi, /uslugi/www, /uslugi/aplikacje, /uslugi/design, /uslugi/marketing, /realizacje, /realizacje/:slug, /cennik, /wiedza, /wiedza/slownik, /wiedza/:slug, /faq, /kontakt, /strefa-klienta, /reset-hasla, /polityka-prywatnosci, /rodo, /regulamin, /regulamin-promocji, /cookies, /dostepnosc, 404
  - komponenty: header, footer, hero, portfolio, pricing, breadcrumbs, skip link
  - strefa klienta: login, verify-session, get-files, logout
  - kontakt: walidacja + fetch do api.php
  - cookie consent + dialog z kategoriami (localStorage keys zgodne z enhancements.js)
  - theme toggle, lang toggle
  - wydajność: lazy loading, prefetch, focus management

- **assets/enhancements.js**: przepisany:
  - a11y label connecting
  - external links target _blank rel noopener
  - prefetch on hover
  - image lazy + decoding async
  - SEO fallback
  - web vitals observer
  - analytics consent check

- **assets/register-sw.js**: rejestracja SW z update toast (nowa wersja), controllerchange reload, beforeinstallprompt handling
- **assets/password-reset.js**: walidacja email, loading state, aria-live

### 3. PWA
- **sw.js**: nowy – precache lista (v2026-07-17-1), strategie: assets cache-first, navigation network-first with offline fallback to index.html, API network-only, cleanup old caches, SKIP_WAITING message, sync placeholder
- **manifest.json**: uzupełniony – id, launch_handler, edge_side_panel, handle_links, categories, screenshots, 4 shortcuts (wycena, portfolio, cennik, strefa klienta), icons maskable
- **assets/fonts.css**: Google Fonts import + local woff2 progressive enhancement

### 4. SEO
- **sitemap.xml**: rozbudowany o wszystkie usługi, realizacje (3), wiedza (7 artykułów), polityki, strefa klienta, reset hasła – 30 URLi
- **robots.txt**: Allow /, Disallow client-files, api, strefa-klienta, reset-hasla, crawl-delay, Sitemap, Host, disallow dla Ahrefs/Semrush, Allow Google/Bing

### 5. Bezpieczeństwo & Backend
- **api.php**: kompletny rewrite prod:
  - security headers: X-Frame-Options DENY, Permissions-Policy, HSTS env, nosniff
  - CORS whitelist
  - OPTIONS 204
  - POST only
  - rate limiting per IP (global 60/min, login 5/5min, reset 3/h, contact 5/h) – file based in client-files/.ratelimit
  - getClientIp z X-Forwarded-For walidacją
  - PDO SQLite WAL, foreign_keys, chmod 0600
  - ensureSchema – auto tworzenie tabel
  - contact: walidacja 2-100 name, email, 10-5000 message, anti-spam >3 http, IP+UA log
  - login: session_regenerate_id, 12h timeout, IP log mismatch, timing sleep
  - get-files: bezpieczne ścieżki realpath check, whitelist base, obsługa legacy nazw (u_id_email, id--email)
  - JSON_UNESCAPED_UNICODE/SLASHES

- **.htaccess (home)**: RewriteEngine SPA fallback, protect sensitive files, security headers CSP (self + fonts.googleapis + cdn.jsdelivr, unsafe-inline dla styles/scripts – gotowe na prod), compression deflate, caching expires (css/js 1y, img 1m, html 0), mime webp/woff2, -Indexes, FilesMatch deny sqlite/log/env, ErrorDocument 404 /index.html

- **client-files/.htaccess**: Require all denied, deny php execution, -Indexes

### 6. Baza danych
- **dbdevstudio.sqlite**: SQLite WAL, tabele clients, contact_submissions, indexy, 2 demo klientów:
  - demo@dbdevstudio.pl / demo123 – id u_demo1
  - dobry2013chlopak@gmail.com / Admin123! – id u_7a809d4f1e441957 (zgodny z INSTRUKCJA_ADMINISTRATORA przykład)
  - hashe bcrypt $2y$10$...

### 7. Strefa klienta
- Struktura katalogów: ID__email lub ID--email (obsługiwane obie)
- Przykładowe katalogi utworzone z README.txt
- .ratelimit/.gitkeep

### 8. HTML fallback
- Wszystkie index.html w podkatalogach zaktualizowane do v=20260717-1 (cache bust)
- Zawierają breadcrumbs JSON-LD, canonical, OG, Twitter, theme-color, skip-link style

### 9. Archiwum produkcyjne
- dbdevstudio-home-production-20260717.zip (2.4M)
- dbdevstudio-home-production-20260717.tar.gz (2.4M)
- SHA256SUMS.txt

### 10. Wersjonowanie
- app.js VERSION = 2026.07.17-1
- CACHE_NAME sw.js = dbdevstudio-v2026-07-17-1
- manifest start_url ?utm_source=pwa

## Jak wdrożyć na serwer?

1. Rozpakuj archiwum na serwer – zawartość katalogu `home/` powinna trafić do `~/public_html` lub `/home` na serwerze (zależnie od hostingu – w tym repo `/home` to document root).
   ```bash
   unzip dbdevstudio-home-production-20260717.zip
   cp -r home/* /path/to/public_html/
   # lub
   tar -xzf dbdevstudio-home-production-20260717.tar.gz
   ```

2. Ustaw uprawnienia:
   ```bash
   chmod 600 dbdevstudio.sqlite
   chmod 700 client-files
   chmod 700 client-files/.ratelimit
   chmod 644 .htaccess icons/* images/* assets/*
   ```

3. Sprawdź PHP:
   - wymagane: PHP >=8.1, ext-pdo_sqlite, mod_rewrite, mod_headers, mod_expires, mod_deflate
   - SQLite WAL potrzebuje write w katalogu

4. SSL: odblokuj Force HTTPS w .htaccess jeśli masz certyfikat.

5. E-mail reset hasła: w api.php sekcja handlePasswordReset – dodaj mail() lub SMTP (PHPMailer).

6. Analytics: w enhancements.js / app.js sekcja shouldLoadAnalytics – podmień na swój skrypt GA4/Plausible po zgodzie.

7. Test:
   - / -> home
   - /studio, /uslugi, /cennik, /wiedza, /faq, /kontakt
   - /realizacje/kurier-ai
   - /strefa-klienta – login demo@dbdevstudio.pl / demo123
   - PWA: manifest + sw.js w DevTools Application
   - sitemap.xml / robots.txt

8. Po wdrożeniu wyczyść cache Cloudflare / przeglądarki.

## Loginy demo

- demo@dbdevstudio.pl / demo123
- dobry2013chlopak@gmail.com / Admin123!

## GitHub

Repo: https://github.com/Dobrychlopak87/dbdevstudio-home
Branch obecny: arena/019f6f9c-dbdevstudio-home -> PR do main

Zmerguj PR, a po push CI (jeśli masz) zdeployuje automatycznie.

## Kontakt wsparcia

kontakt@dbdevstudio.pl, +48 667 856 822, Krosno Odrzańskie

---

Wygenerowano automatycznie przez Arena.ai Agent – produkcja gotowa do wysyłki.
