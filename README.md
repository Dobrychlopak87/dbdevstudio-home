# DBDEVSTUDIO.pl - Kompletna kopia strony

**Data archiwizacji:** 12 lipca 2026  
**Autor:** Dobrychlopak87 (DBDevStudio)  
**URL:** https://dbdevstudio.pl/

---

## Opis

To repozytorium zawiera kompletną kopie strony internetowej **DBDEVSTUDIO.pl** - studia projektowego oferujacego uslugi w zakresie tworzenia stron WWW, aplikacji, projektowania graficznego oraz marketingu digitalowego.

Strona znajduje sie w katalogu `/home/` (tak jak na serwerze produkcyjnym).

---

## Struktura repozytorium

```
/
├── home/                          # Glowny katalog strony (jak na serwerze)
│   ├── index.html                 # Entry point SPA
│   ├── manifest.json              # PWA Manifest
│   ├── sw.js                      # Service Worker
│   ├── api.php                    # Backend API
│   ├── dbdevstudio.sqlite         # Baza danych SQLite
│   ├── sitemap.xml                # Mapa strony
│   ├── robots.txt                 # Reguly dla robotow
│   ├── assets/                    # Zasoby statyczne
│   │   ├── app.js                 # Glowny bundle React (minified)
│   │   ├── app.css                # Style glowne
│   │   ├── fonts.css              # Definicje fontow
│   │   ├── enhancements.js        # SEO, cookies, accessibility
│   │   ├── register-sw.js         # Rejestracja Service Workera
│   │   ├── password-reset.js      # Reset hasla
│   │   └── fonts/                 # Fonty (Inter, Space Grotesk)
│   ├── icons/                     # Ikony PWA/Favicon
│   ├── images/                    # Obrazy
│   │   ├── hero/                  # Hero images (4 kategorie)
│   │   ├── portfolio/             # Zdjecia portfolio
│   │   ├── placeholders/          # Placeholdery
│   │   └── misc/                  # Inne obrazy
│   ├── client-files/              # Pliki klientow (strefa klienta)
│   ├── cennik/                    # Cennik
│   ├── cookies/                   # Polityka cookies
│   ├── dostepnosc/                # Deklaracja dostepnosci
│   ├── faq/                       # FAQ
│   ├── kontakt/                   # Kontakt
│   ├── polityka-prywatnosci/      # Polityka prywatnosci
│   ├── realizacje/                # Portfolio
│   ├── regulamin/                 # Regulamin
│   ├── regulamin-promocji/        # Regulamin promocji
│   ├── reset-hasla/               # Reset hasla
│   ├── rodo/                      # RODO
│   ├── strefa-klienta/            # Strefa klienta
│   ├── studio/                    # O nas
│   ├── uslugi/                    # Uslugi
│   └── wiedza/                    # Baza wiedzy / Blog
└── dokumentacja/                  # Dokumentacja architektury
    └── index.html                 # Interaktywna dokumentacja z diagramami
```

---

## Stack technologiczny

| Technologia | Wersja | Opis |
|-------------|--------|------|
| React | 19.2.6 | Biblioteka UI |
| React Router | v7 | Routing client-side |
| Tailwind CSS | v3 | Framework CSS |
| Vite | - | Bundler |
| PWA | - | Progressive Web App |

---

## Strony (Routes)

| Sciezka | Opis |
|---------|------|
| `/` | Strona glowna |
| `/studio` | O nas / Studio |
| `/uslugi` | Uslugi (glowna) |
| `/uslugi/www` | Strony WWW |
| `/uslugi/aplikacje` | Aplikacje |
| `/uslugi/design` | Projektowanie |
| `/uslugi/marketing` | Marketing |
| `/realizacje` | Portfolio |
| `/realizacje/:slug` | Szczegoly projektu |
| `/cennik` | Cennik |
| `/wiedza` | Baza wiedzy |
| `/wiedza/slownik` | Slownik pojec |
| `/wiedza/:slug` | Artykul |
| `/faq` | FAQ |
| `/kontakt` | Kontakt |
| `/strefa-klienta` | Strefa klienta (wymaga logowania) |
| `/reset-hasla` | Reset hasla |
| `/polityka-prywatnosci` | Polityka prywatnosci |
| `/rodo` | RODO |
| `/regulamin` | Regulamin |
| `/regulamin-promocji` | Regulamin promocji |
| `/cookies` | Polityka cookies |
| `/dostepnosc` | Deklaracja dostepnosci |
| `*` | 404 Not Found |

---

## Dokumentacja

Pelna dokumentacja architektury z interaktywnymi diagramami Mermaid znajduje sie w katalogu `/dokumentacja/`.

Otworz `dokumentacja/index.html` w przegladarce, aby zobaczyc:
- Diagram architektury systemu
- Diagram routingu
- Drzewo komponentow
- Strukture katalogow
- Przeplyw danych
- Stack technologiczny

---

## Funkcjonalnosci

- [x] Single Page Application (SPA)
- [x] Routing client-side
- [x] Progressive Web App (PWA)
- [x] Service Worker + offline cache
- [x] Dwujezycznosc (PL/EN)
- [x] Dark/Light mode
- [x] Responsywny design (mobile-first)
- [x] SEO (meta tagi, Open Graph, Schema.org)
- [x] Cookie consent dialog
- [x] Strefa klienta z uwierzytelnianiem
- [x] Reset hasla
- [x] Breadcrumbs navigation
- [x] Skip link (dostepnosc)

---

## Licencja

Wszelkie prawa zastrzezone. (c) 2026 DBDEVSTUDIO.
