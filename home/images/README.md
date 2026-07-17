# Images – DBDEVSTUDIO

**Zasada:** Oryginalne grafiki z serwera produkcyjnego są zachowane, NIE generowane.

Ten katalog zawiera oryginalną strukturę z produkcji:
- `hero/hero-www.webp`, `hero-apps.webp`, `hero-design.webp`, `hero-seo.webp`
- `portfolio/kurier-ai.webp`, `nano4hr.webp`, `tiktok-reel-studio-pro.webp`
- `screenshots-wide.webp`, `screenshots-mobile.webp`
- `placeholders/`, `misc/og-default.webp`

W tym repo (po incydencie z AI) obrazy zostały przywrócone jako **proste placeholdery SVG + solid-color WEBP** pokazujące poprawną metodę wyświetlania. Na produkcji należy podmienić je na oryginały z `https://dbdevstudio.pl/images/...`.

## Ulepszona metoda wyświetlania (zamiast generowania)

W `assets/app.css` i `assets/app.js` dopracowano:

1. **Responsive & CLS prevention**
   - `aspect-ratio: 16/10` + `object-fit: cover` + `width/height` attributes
   - `content-visibility: auto`
   - `height:auto` dla img[width][height]

2. **Lazy & performance**
   - `loading="lazy"` (eager tylko dla hero-www)
   - `decoding="async"`
   - shimmer skeleton + blur placeholder (`.loaded` class fade-in)

3. **Fallback & error handling**
   - `onerror` → próba SVG fallback (hero/portfolio mają SVG obok WEBP)
   - po 2 fail → `placeholders/placeholder-800x600.webp`
   - `data-fallbackAttempted` zapobiega loop

4. **Hover & UX**
   - `transform: scale(1.02) rotate(0.5deg)` na hero, `scale(1.03)` na portfolio
   - smooth transition 0.4s

5. **Accessibility**
   - wszystkie img mają `alt` (generowane w app.js)
   - decorative mają `alt=""`

6. **Caching**
   - WEBP z długim Expires (1 miesiąc) w .htaccess
   - SW cache-first dla /images/

7. **SVG placeholders**
   - Obok każdego WEBP jest SVG z tym samym basename (np. `hero-www.svg` obok `hero-www.webp`)
   - JS przy błędzie próbuje załadować SVG

Na serwerze produkcyjnym: skopiuj oryginalne pliki z backupu / z live (np. via FTP z `https://dbdevstudio.pl/images/...` jeśli dostępne) nadpisując placeholdery. Wyświetlanie pozostanie poprawione dzięki CSS/JS.

**Nie generuj grafik AI – używaj oryginałów.**
