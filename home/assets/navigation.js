/* Minimal navigation enhancement: keeps the existing page layout and adds only the requested dropdown links. */
(function () {
  'use strict';

  function addNavigation() {
    if (!document.body || document.querySelector('.site-navigation')) return;

    var header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML =
      '<nav class="site-navigation" aria-label="Główna nawigacja">' +
        '<div class="site-navigation__links">' +
          '<a href="/studio">Studio</a>' +
          '<div class="site-navigation__dropdown">' +
            '<a href="/uslugi" aria-haspopup="true">Usługi</a>' +
            '<div class="site-navigation__submenu">' +
              '<a href="/uslugi/www">Strony WWW</a>' +
              '<a href="/uslugi/aplikacje">Aplikacje</a>' +
              '<a href="/uslugi/design">Design</a>' +
              '<a href="/uslugi/marketing">Marketing</a>' +
            '</div>' +
          '</div>' +
          '<a href="/realizacje">Portfolio</a>' +
          '<a href="/cennik">Cennik</a>' +
          '<div class="site-navigation__dropdown">' +
            '<a href="/wiedza" aria-haspopup="true">Wiedza</a>' +
            '<div class="site-navigation__submenu site-navigation__submenu--knowledge">' +
              '<a href="/wiedza/slownik">Słownik pojęć</a>' +
              '<a href="/wiedza/restauracja-menu-online-zamowienia">Restauracja: menu online i zamówienia</a>' +
              '<a href="/wiedza/sklep-osiedlowy-vs-sieciowka">Sklep osiedlowy vs sieciówka</a>' +
              '<a href="/wiedza/skrzynka-firmowa-podpis-i-marketing">Skrzynka firmowa, podpis i marketing</a>' +
              '<a href="/wiedza/strona-www-dla-salonu-fryzjerskiego">Strona WWW dla salonu fryzjerskiego</a>' +
              '<a href="/wiedza/warsztat-samochodowy-strona-www">Warsztat samochodowy — strona WWW</a>' +
              '<a href="/wiedza/wlasna-domena-i-email-firmowy">Własna domena i email firmowy</a>' +
            '</div>' +
          '</div>' +
          '<a href="/kontakt">Kontakt</a>' +
        '</div>' +
      '</nav>';
    document.body.insertBefore(header, document.body.firstChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addNavigation);
  else addNavigation();
}());
